# A&G Funerals — Developer Documentation

Document management application for franchises. Users upload documents (PDF, PNG, JPG) that are automatically analyzed by **Amazon Textract** to extract raw text, form fields, and tables. Original files are deleted immediately after extraction — only structured data is retained.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User (Browser)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
                   ┌───────────────────────┐
                   │   CloudFront (CDN)    │
                   └──────┬───────┬────────┘
                  /data*  │       │  /*
                          │       ▼
                          │  ┌─────────────────────┐
                          │  │  S3 (web-frontend)  │
                          │  │  React SPA (static) │
                          │  └─────────────────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │  API Gateway REST + stage │
              │  Cognito Authorizer (JWT) │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Lambda: api-backend        │  (Node.js 18, private VPC)
              │  GET /data/documents        │
              │  GET /data/documents/{id}   │
              └─────────────┬───────────────┘
                            │ RDS Data API
                            ▼
              ┌─────────────────────────────┐
              │  Aurora PostgreSQL          │
              │  Serverless v2 (0.5–2 ACU)  │
              │  KMS encrypted, private     │
              └─────────────────────────────┘

  S3 Upload (Cognito Identity Pool credentials)
  ┌─────────────────────────────┐
  │  S3 Bucket (documents)      │  uploads/*, HTTPS-only, versioned
  └─────────────┬───────────────┘
                │ trigger s3:ObjectCreated
                ▼
  ┌─────────────────────────────────────┐
  │  Lambda: document-processor         │  (Node.js 18, private VPC)
  │  1. AnalyzeDocument (Textract)      │
  │     → FORMS + TABLES + raw text     │
  │  2. DELETE file from S3             │
  │  3. INSERT results → Aurora         │
  └─────────────────────────────────────┘
```

### AWS Services

| Service | Role |
|---|---|
| **CloudFront** | CDN + single HTTPS entry point for frontend and API |
| **S3** (3 buckets) | `web-frontend`: React assets — `documents`: temporary upload — `logs`: CloudFront logs |
| **API Gateway** | REST API with `prod` stage, protected by Cognito, CORS enabled (OPTIONS without auth) |
| **Lambda** (×2) | `document-processor`: Textract processing — `api-backend`: REST endpoints |
| **Amazon Textract** | FORMS + TABLES + raw text extraction from documents |
| **Aurora PostgreSQL Serverless v2** | Storage of extracted data via RDS Data API |
| **Cognito User Pool** | Email/password authentication with email verification |
| **Cognito Identity Pool** | Temporary AWS credentials for browser-side S3 upload |
| **KMS** | RDS + SNS encryption |
| **Secrets Manager** | Aurora password (automatically managed) |
| **VPC** | Network isolation — Lambdas and RDS in private subnets, no NAT |
| **VPC Endpoints** | S3 (Gateway), Textract (Interface), Secrets Manager (Interface) |
| **CloudWatch + SNS** | Lambda error alarm → SNS notification |

### Network

```
VPC 10.0.0.0/16
├── Public subnets  (×2 AZ) : 10.0.0.0/24, 10.0.1.0/24   → Internet Gateway
└── Private subnets (×2 AZ) : 10.0.100.0/24, 10.0.101.0/24 → VPC Endpoints only
      ├── Lambda document-processor
      ├── Lambda api-backend
      └── Aurora cluster (RDS subnet group)
```

No NAT Gateway — all outbound traffic to AWS goes through private VPC endpoints.

---

## Project Structure

```
.
├── frontend/                  # React 18 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx           # Cognito login form
│   │   │   ├── Register.jsx        # Sign-up + email code confirmation
│   │   │   ├── UploadDocument.jsx  # S3 upload via Cognito Identity Pool
│   │   │   └── DocumentList.jsx    # Document list + detail view
│   │   ├── App.jsx            # login/register/app routing + Cognito handlers
│   │   ├── config.js          # Configuration values (Terraform outputs)
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── lambda/
│   ├── document_processor/
│   │   └── index.js           # Textract AnalyzeDocument → S3 delete → RDS insert
│   └── api_backend/
│       └── index.js           # GET /data/documents, GET /data/documents/{id}
│
├── terraform/
│   ├── provider.tf            # AWS provider + version constraints
│   ├── variables.tf           # Variables (region, project_name, environment, vpc_cidr)
│   ├── outputs.tf             # Post-deployment URLs and IDs
│   ├── vpc.tf                 # VPC, public/private subnets, route tables
│   ├── vpc_endpoints.tf       # S3, Textract, Secrets Manager endpoints
│   ├── s3.tf                  # documents, web-frontend, logs buckets + policies
│   ├── cognito.tf             # User Pool, App Client, Identity Pool + IAM roles
│   ├── lambda.tf              # Lambda functions + permissions + S3 trigger
│   ├── database.tf            # Aurora Serverless v2 PostgreSQL
│   ├── api.tf                 # API Gateway + prod stage + CloudFront
│   ├── security.tf            # Security groups, IAM roles/policies, KMS
│   └── monitoring.tf          # CloudWatch log groups, Lambda alarm, SNS topic
│
├── lambda_payload.zip         # document-processor artifact (generated locally)
├── api_payload.zip            # api-backend artifact (generated locally)
└── .gitignore
```

---

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured (`aws configure`)
- [Node.js](https://nodejs.org/) >= 18.x and npm
- Sufficient IAM permissions: Lambda, RDS, S3, Cognito, CloudFront, API Gateway, VPC, KMS, IAM

---

## Full Deployment (first time)

### 1. Package the Lambdas

```bash
cd lambda/document_processor
zip -r ../../lambda_payload.zip .

cd ../api_backend
zip -r ../../api_payload.zip .

cd ../..
```

### 2. Deploy the Terraform Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Note the outputs displayed at the end:

```
api_gateway_url          = "https://<id>.execute-api.us-west-2.amazonaws.com/prod"
cloudfront_url           = "https://<id>.cloudfront.net"
cognito_client_id        = "<client_id>"
cognito_identity_pool_id = "us-west-2:<uuid>"
cognito_user_pool_id     = "us-west-2_<id>"
documents_bucket         = "franchise-app-documents-dev"
```

### 3. Configure the Frontend

Update `frontend/src/config.js` with the Terraform output values:

```js
const config = {
  region:           "us-west-2",
  userPoolId:       "<cognito_user_pool_id>",
  userPoolClientId: "<cognito_client_id>",
  identityPoolId:   "<cognito_identity_pool_id>",
  apiUrl:           "<api_gateway_url>",
  documentsBucket:  "<documents_bucket>"
};
```

### 4. Build and Deploy the Frontend

```bash
cd frontend
npm install
npm run build

BUCKET="franchise-app-web-frontend-dev"  # or: cd ../terraform && terraform output documents_bucket

aws s3 sync dist/ s3://$BUCKET --delete
```

### 5. Invalidate the CloudFront Cache

```bash
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" --output text)

aws cloudfront create-invalidation \
  --distribution-id $DIST_ID --paths "/*"
```

The application is accessible at the `cloudfront_url` output.

---

## Database Initialization

Aurora Serverless v2 does not create the schema automatically. Run once via the RDS Query Editor (AWS console) or from a bastion host:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id           SERIAL PRIMARY KEY,
  file_key     VARCHAR(512) UNIQUE NOT NULL,
  raw_text     TEXT,
  forms        JSONB,
  tables       JSONB,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

> The schema stores three types of Textract output: `raw_text` (line-by-line plain text), `forms` (key/value pairs as JSONB), `tables` (2D arrays as JSONB).

---

## Updating the Lambdas

After modifying Lambda code:

```bash
# document-processor
cd lambda/document_processor
zip -r ../../lambda_payload.zip .
cd ../..
aws lambda update-function-code \
  --function-name franchise-app-document-processor \
  --zip-file fileb://lambda_payload.zip

# api-backend
cd lambda/api_backend
zip -r ../../api_payload.zip .
cd ../..
aws lambda update-function-code \
  --function-name franchise-app-api-backend \
  --zip-file fileb://api_payload.zip
```

## Updating the Frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://franchise-app-web-frontend-dev --delete

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" --output text)
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID --paths "/*"
```

---

## Terraform Variables

| Variable | Default | Description |
|---|---|---|
| `aws_region` | `us-west-2` | Deployment region |
| `project_name` | `franchise-app` | Prefix for all resources |
| `environment` | `dev` | Environment suffix (`dev`, `prod`) |
| `vpc_cidr` | `10.0.0.0/16` | VPC CIDR block |

To deploy a `prod` environment:

```bash
terraform apply -var="environment=prod" -var="project_name=franchise-app"
```

---

## Creating a Test User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <cognito_user_pool_id> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true \
  --temporary-password "TempPass1!" \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id <cognito_user_pool_id> \
  --username user@example.com \
  --password "StrongPassword1!" \
  --permanent
```

---

## Known Gotchas

- **Browser S3 upload**: the AWS S3 browser SDK requires a `Blob` as the `Body` — passing a raw `File` object or `Uint8Array` causes a `getReader is not a function` error.
- **CORS**: the `OPTIONS` method on API Gateway is configured without authentication to allow preflight requests. The Lambda returns `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` headers on all responses.
- **Aurora Serverless v2**: uses `engine_mode = "provisioned"` (required for Serverless v2), not `"serverless"`. Version `16.6` is the latest available in `us-west-2` at time of deployment.
- **VPC without NAT**: all Lambda outbound traffic to AWS goes through VPC endpoints. Add a NAT Gateway if an external (internet) dependency is needed.

---

## Local Frontend Development

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> `config.js` must point to the API Gateway and Cognito deployed on AWS — there is no local emulation of backend services.

---

## Monitoring

- **Lambda logs**: CloudWatch Log Groups `/aws/lambda/franchise-app-document-processor` and `/aws/lambda/franchise-app-api-backend`, 14-day retention
- **Alarm**: `franchise-app-lambda-errors` — triggers if ≥ 1 Lambda error within 60s → SNS notification to `franchise-app-alerts-topic`
- **Subscribe to alerts**:
```bash
aws sns subscribe \
  --topic-arn <alerts_topic_arn> \
  --protocol email \
  --notification-endpoint your@email.com
```

---

## Destroying the Infrastructure

```bash
cd terraform
terraform destroy
```

> S3 buckets must be emptied manually before destroy if `force_destroy` is not enabled.

```bash
aws s3 rm s3://franchise-app-documents-dev --recursive
aws s3 rm s3://franchise-app-web-frontend-dev --recursive
aws s3 rm s3://franchise-app-logs-dev --recursive
```
