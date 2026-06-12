const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");

const rds = new RDSDataClient({ region: process.env.AWS_REGION, requestTimeout: 5000 });

const DB_PARAMS = {
  resourceArn: process.env.DB_CLUSTER_ARN,
  secretArn: process.env.DB_SECRET_ARN,
  database: process.env.DB_NAME
};

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,Accept"
};

const response = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;

  // Preflight CORS
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    // GET /data/documents — liste tous les documents traités
    if (method === "GET" && path.startsWith("/data/documents")) {
      const result = await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: "SELECT id, file_key, TO_CHAR(processed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') FROM documents ORDER BY processed_at DESC LIMIT 50"
      }));

      console.log("RDS List results:", JSON.stringify(result.records));

      const documents = result.records.map(row => ({
        id: row[0].longValue || row[0].stringValue || String(row[0].doubleValue || ""),
        file_key: row[1].stringValue,
        processed_at: row[2].stringValue
      }));

      return response(200, { documents });
    }

    // GET /data/documents/{id} — détail d'un document
    if (method === "GET" && path.match(/\/data\/documents\/\d+/)) {
      const id = path.split("/").pop();
      const result = await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: "SELECT id, file_key, raw_text, forms::text, tables::text, TO_CHAR(processed_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') FROM documents WHERE id = :id",
        parameters: [{ name: "id", value: { longValue: parseInt(id) } }]
      }));

      console.log("RDS Detail result:", JSON.stringify(result.records));

      if (!result.records.length) return response(404, { error: "Document not found" });

      const row = result.records[0];
      return response(200, {
        id: row[0].longValue || row[0].stringValue || String(row[0].doubleValue || ""),
        file_key: row[1].stringValue,
        raw_text: row[2].stringValue || "",
        forms: JSON.parse(row[3].stringValue || "{}"),
        tables: JSON.parse(row[4].stringValue || "[]"),
        processed_at: row[5].stringValue
      });
    }

    return response(404, { error: "Route not found" });

  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};
