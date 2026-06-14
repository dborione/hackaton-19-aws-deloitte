const { TextractClient, AnalyzeDocumentCommand, StartDocumentAnalysisCommand, GetDocumentAnalysisCommand } = require("@aws-sdk/client-textract");
const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");
const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const textract = new TextractClient({ region: process.env.AWS_REGION });
const rds = new RDSDataClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Reconstruit les paires clé/valeur depuis les blocs Textract FORMS
function extractForms(blocks) {
  const blockMap = {};
  blocks.forEach(b => { blockMap[b.Id] = b; });

  const fields = {};
  blocks
    .filter(b => b.BlockType === "KEY_VALUE_SET" && b.EntityTypes?.includes("KEY"))
    .forEach(keyBlock => {
      const keyText = getTextFromBlock(keyBlock, blockMap);
      const valueBlock = keyBlock.Relationships
        ?.find(r => r.Type === "VALUE")
        ?.Ids?.map(id => blockMap[id])
        .find(Boolean);
      const valueText = valueBlock ? getTextFromBlock(valueBlock, blockMap) : "";
      if (keyText) fields[keyText.trim()] = valueText.trim();
    });
  return fields;
}

// Reconstruit les tableaux depuis les blocs Textract TABLES
function extractTables(blocks) {
  const blockMap = {};
  blocks.forEach(b => { blockMap[b.Id] = b; });

  return blocks
    .filter(b => b.BlockType === "TABLE")
    .map(table => {
      const cells = table.Relationships
        ?.find(r => r.Type === "CHILD")
        ?.Ids?.map(id => blockMap[id])
        .filter(b => b?.BlockType === "CELL") || [];

      const grid = {};
      cells.forEach(cell => {
        const row = cell.RowIndex;
        const col = cell.ColumnIndex;
        if (!grid[row]) grid[row] = {};
        grid[row][col] = getTextFromBlock(cell, blockMap);
      });

      return Object.values(grid).map(row => Object.values(row));
    });
}

function getTextFromBlock(block, blockMap) {
  return block.Relationships
    ?.find(r => r.Type === "CHILD")
    ?.Ids?.map(id => blockMap[id])
    .filter(b => b?.BlockType === "WORD")
    .map(b => b.Text)
    .join(" ") || "";
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      console.log(`Processing document: s3://${bucket}/${key} (${head.ContentLength} bytes)`);

      const isPdf = key.toLowerCase().endsWith(".pdf");
      let blocks = [];

      if (isPdf) {
        console.log(`Starting ASYNC analysis for PDF: ${key}`);
        const startResult = await textract.send(new StartDocumentAnalysisCommand({
          DocumentLocation: { S3Object: { Bucket: bucket, Name: key } },
          FeatureTypes: ["FORMS", "TABLES"]
        }));

        const jobId = startResult.JobId;
        let jobStatus = "IN_PROGRESS";
        let asyncResult;

        // Poll for results (max 50 seconds to stay within Lambda 60s timeout)
        let attempts = 0;
        while (jobStatus === "IN_PROGRESS" && attempts < 50) {
          await sleep(1000);
          asyncResult = await textract.send(new GetDocumentAnalysisCommand({ JobId: jobId }));
          jobStatus = asyncResult.JobStatus;
          attempts++;
        }

        if (jobStatus !== "SUCCEEDED") {
          throw new Error(`Textract async job failed or timed out with status: ${jobStatus}`);
        }
        blocks = asyncResult.Blocks;
      } else {
        console.log(`Starting SYNC analysis for image: ${key}`);
        const result = await textract.send(new AnalyzeDocumentCommand({
          Document: { S3Object: { Bucket: bucket, Name: key } },
          FeatureTypes: ["FORMS", "TABLES"]
        }));
        blocks = result.Blocks;
      }

      const rawText = blocks
        .filter(b => b.BlockType === "LINE")
        .map(b => b.Text)
        .join("\n");

      const forms = extractForms(blocks);
      const tables = extractTables(blocks);

      await rds.send(new ExecuteStatementCommand({
        resourceArn: process.env.DB_CLUSTER_ARN,
        secretArn: process.env.DB_SECRET_ARN,
        database: process.env.DB_NAME,
        sql: `INSERT INTO documents (file_key, raw_text, forms, tables, processed_at)
              VALUES (:key, :raw, :forms::jsonb, :tables::jsonb, NOW())
              ON CONFLICT (file_key) DO UPDATE
                SET raw_text = :raw, forms = :forms::jsonb, tables = :tables::jsonb, processed_at = NOW()`,
        parameters: [
          { name: "key", value: { stringValue: key } },
          { name: "raw", value: { stringValue: rawText } },
          { name: "forms", value: { stringValue: JSON.stringify(forms) } },
          { name: "tables", value: { stringValue: JSON.stringify(tables) } }
        ]
      }));

      console.log(`Document ${key} successfully processed and inserted into DB`);

      // Delete from S3 only AFTER successful DB insertion
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      console.log(`File ${key} deleted from S3`);

    } catch (err) {
      console.error(`ERROR processing ${key}:`, err);
      // We don't delete the file here so it can be retried or investigated
      throw err;
    }
  }

  return { statusCode: 200, body: "OK" };
};
