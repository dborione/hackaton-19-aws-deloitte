const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");
const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");

const textract = new TextractClient({ region: process.env.AWS_REGION });
const rds = new RDSDataClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing document: s3://${bucket}/${key}`);

    const textractResult = await textract.send(new DetectDocumentTextCommand({
      Document: { S3Object: { Bucket: bucket, Name: key } }
    }));

    const extractedText = textractResult.Blocks
      .filter(b => b.BlockType === "LINE")
      .map(b => b.Text)
      .join("\n");

    await rds.send(new ExecuteStatementCommand({
      resourceArn: process.env.DB_CLUSTER_ARN,
      secretArn: process.env.DB_SECRET_ARN,
      database: process.env.DB_NAME,
      sql: `INSERT INTO documents (file_key, extracted_text, processed_at)
            VALUES (:key, :text, NOW())
            ON CONFLICT (file_key) DO UPDATE SET extracted_text = :text, processed_at = NOW()`,
      parameters: [
        { name: "key",  value: { stringValue: key } },
        { name: "text", value: { stringValue: extractedText } }
      ]
    }));

    console.log(`Document ${key} stored successfully`);
  }

  return { statusCode: 200, body: "OK" };
};
