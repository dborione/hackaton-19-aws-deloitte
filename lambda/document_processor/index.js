const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");
const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const textract = new TextractClient({ region: process.env.AWS_REGION });
const rds      = new RDSDataClient({ region: process.env.AWS_REGION });
const s3       = new S3Client({ region: process.env.AWS_REGION });

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

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key    = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing document: s3://${bucket}/${key}`);

    let rawText, forms, tables;
    try {
      const result = await textract.send(new AnalyzeDocumentCommand({
        Document:        { S3Object: { Bucket: bucket, Name: key } },
        FeatureTypes:    ["FORMS", "TABLES"]
      }));

      const blocks = result.Blocks;

      rawText = blocks
        .filter(b => b.BlockType === "LINE")
        .map(b => b.Text)
        .join("\n");

      forms  = extractForms(blocks);
      tables = extractTables(blocks);

    } finally {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      console.log(`File ${key} deleted from S3 after extraction`);
    }

    await rds.send(new ExecuteStatementCommand({
      resourceArn: process.env.DB_CLUSTER_ARN,
      secretArn:   process.env.DB_SECRET_ARN,
      database:    process.env.DB_NAME,
      sql: `INSERT INTO documents (file_key, raw_text, forms, tables, processed_at)
            VALUES (:key, :raw, :forms, :tables, NOW())
            ON CONFLICT (file_key) DO UPDATE
              SET raw_text = :raw, forms = :forms, tables = :tables, processed_at = NOW()`,
      parameters: [
        { name: "key",    value: { stringValue: key } },
        { name: "raw",    value: { stringValue: rawText } },
        { name: "forms",  value: { stringValue: JSON.stringify(forms) } },
        { name: "tables", value: { stringValue: JSON.stringify(tables) } }
      ]
    }));

    console.log(`Document ${key} — ${Object.keys(forms).length} fields, ${tables.length} tables extracted`);
  }

  return { statusCode: 200, body: "OK" };
};
