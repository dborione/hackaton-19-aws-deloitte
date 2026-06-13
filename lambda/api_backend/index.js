const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");

const rds = new RDSDataClient({
  region: process.env.AWS_REGION,
  requestTimeout: 5000
});

const DB_PARAMS = {
  resourceArn: process.env.DB_CLUSTER_ARN,
  secretArn: process.env.DB_SECRET_ARN,
  database: process.env.DB_NAME
};

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type"
};

const response = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body)
});

function getMethod(event) {
  return event.httpMethod || event.requestContext?.http?.method;
}

function getPath(event) {
  return event.path || event.rawPath;
}

function getUserId(event) {
  return (
    event.requestContext?.authorizer?.claims?.sub ||
    event.requestContext?.authorizer?.jwt?.claims?.sub ||
    "anonymous"
  );
}

function parseBody(event) {
  if (!event.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  return JSON.parse(rawBody);
}

exports.handler = async (event) => {
  const method = getMethod(event);
  const path = getPath(event);

  console.log("REQUEST", {
    method,
    path,
    hasBody: !!event.body,
    userId: getUserId(event)
  });

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  try {
    /*
      GET /data/documents/{id}
    */
    if (method === "GET" && path.match(/^\/data\/documents\/\d+$/)) {
      const id = path.split("/").pop();

      const result = await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: `
          SELECT id, file_key, raw_text, forms, tables, processed_at
          FROM documents
          WHERE id = :id
        `,
        parameters: [
          {
            name: "id",
            value: { longValue: parseInt(id, 10) }
          }
        ]
      }));

      if (!result.records || !result.records.length) {
        return response(404, { error: "Document not found" });
      }

      const row = result.records[0];

      return response(200, {
        id: row[0].longValue,
        file_key: row[1].stringValue,
        raw_text: row[2].stringValue,
        forms: JSON.parse(row[3].stringValue || "{}"),
        tables: JSON.parse(row[4].stringValue || "[]"),
        processed_at: row[5].stringValue
      });
    }

    /*
      GET /data/documents
    */
    if (method === "GET" && path === "/data/documents") {
      const result = await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: `
          SELECT id, file_key, processed_at
          FROM documents
          ORDER BY processed_at DESC
          LIMIT 50
        `
      }));

      const documents = (result.records || []).map(row => ({
        id: row[0].longValue,
        file_key: row[1].stringValue,
        processed_at: row[2].stringValue
      }));

      return response(200, { documents });
    }

    /*
      POST /data/answers
      Sauvegarde les questions + réponses.
    */
    if (method === "POST" && path === "/data/answers") {
      const userId = getUserId(event);
      const body = parseBody(event);

      console.log("SAVE ANSWERS BODY", JSON.stringify(body));

      if (!body.pageId || typeof body.answers !== "object") {
        return response(400, {
          error: "Missing pageId or answers",
          received: body
        });
      }

      const questions = Array.isArray(body.questions) ? body.questions : [];

      await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: `
          INSERT INTO user_answers (user_id, page_id, questions, answers)
          VALUES (
            :user_id,
            :page_id,
            CAST(:questions AS jsonb),
            CAST(:answers AS jsonb)
          )
          ON CONFLICT (user_id, page_id)
          DO UPDATE SET
            questions = EXCLUDED.questions,
            answers = EXCLUDED.answers,
            updated_at = CURRENT_TIMESTAMP
        `,
        parameters: [
          {
            name: "user_id",
            value: { stringValue: userId }
          },
          {
            name: "page_id",
            value: { stringValue: body.pageId }
          },
          {
            name: "questions",
            value: { stringValue: JSON.stringify(questions) }
          },
          {
            name: "answers",
            value: { stringValue: JSON.stringify(body.answers) }
          }
        ]
      }));

      return response(200, {
        message: "Answers saved",
        userId,
        pageId: body.pageId,
        questionsCount: questions.length,
        answersCount: Object.keys(body.answers).length
      });
    }

    /*
      GET /data/answers/{pageId}
      Recharge les réponses d'une page.
    */
    if (method === "GET" && path.startsWith("/data/answers/")) {
      const userId = getUserId(event);
      const pageId = decodeURIComponent(path.split("/").pop());

      console.log("LOAD ANSWERS", {
        userId,
        pageId
      });

      const result = await rds.send(new ExecuteStatementCommand({
        ...DB_PARAMS,
        sql: `
          SELECT questions, answers, updated_at
          FROM user_answers
          WHERE user_id = :user_id AND page_id = :page_id
        `,
        parameters: [
          {
            name: "user_id",
            value: { stringValue: userId }
          },
          {
            name: "page_id",
            value: { stringValue: pageId }
          }
        ]
      }));

      if (!result.records || !result.records.length) {
        return response(200, {
          questions: [],
          answers: {}
        });
      }

      const row = result.records[0];

      return response(200, {
        questions: JSON.parse(row[0].stringValue || "[]"),
        answers: JSON.parse(row[1].stringValue || "{}"),
        updated_at: row[2].stringValue
      });
    }

    return response(404, {
      error: "Route not found",
      method,
      path
    });

  } catch (err) {
    console.error("LAMBDA ERROR", err);

    return response(500, {
      error: "Internal server error",
      message: err.message
    });
  }
};