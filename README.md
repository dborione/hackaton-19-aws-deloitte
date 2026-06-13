# A&G Funerals — Documentation Développeur

Application de gestion de documents pour franchises. Les utilisateurs uploadent des documents (PDF, PNG, JPG) qui sont automatiquement analysés par **Amazon Textract** pour en extraire le texte brut, les champs de formulaire et les tableaux. Les fichiers originaux sont supprimés immédiatement après extraction — seules les données structurées sont conservées.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Utilisateur (Browser)                    │
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
              │  Lambda: api-backend        │  (Node.js 18, VPC privé)
              │  GET /data/documents        │
              │  GET /data/documents/{id}   │
              └─────────────┬───────────────┘
                            │ RDS Data API
                            ▼
              ┌─────────────────────────────┐
              │  Aurora PostgreSQL          │
              │  Serverless v2 (0.5–2 ACU)  │
              │  Chiffré KMS, subnet privé  │
              └─────────────────────────────┘

  Upload S3 (credentials Cognito Identity Pool)
  ┌─────────────────────────────┐
  │  S3 Bucket (documents)      │  uploads/*, HTTPS-only, versionné
  └─────────────┬───────────────┘
                │ trigger s3:ObjectCreated
                ▼
  ┌─────────────────────────────────────┐
  │  Lambda: document-processor         │  (Node.js 18, VPC privé)
  │  1. AnalyzeDocument (Textract)      │
  │     → FORMS + TABLES + raw text     │
  │  2. DELETE fichier S3               │
  │  3. INSERT résultats → Aurora       │
  └─────────────────────────────────────┘
```

### Services AWS utilisés

| Service | Rôle |
|---|---|
| **CloudFront** | CDN + point d'entrée unique HTTPS pour le frontend et l'API |
| **S3** (3 buckets) | `web-frontend` : assets React — `documents` : upload temporaire — `logs` : logs CloudFront |
| **API Gateway** | REST API avec stage `prod`, protégée par Cognito, CORS activé (OPTIONS sans auth) |
| **Lambda** (×2) | `document-processor` : traitement Textract — `api-backend` : endpoints REST |
| **Amazon Textract** | Extraction FORMS + TABLES + texte brut depuis les documents |
| **Aurora PostgreSQL Serverless v2** | Stockage des données extraites via RDS Data API |
| **Cognito User Pool** | Authentification email/password avec vérification email |
| **Cognito Identity Pool** | Credentials AWS temporaires pour l'upload S3 depuis le browser |
| **KMS** | Chiffrement RDS + SNS |
| **Secrets Manager** | Mot de passe Aurora (géré automatiquement) |
| **VPC** | Isolation réseau — Lambdas et RDS en subnet privé, sans NAT |
| **VPC Endpoints** | S3 (Gateway), Textract (Interface), Secrets Manager (Interface) |
| **CloudWatch + SNS** | Alarme sur erreurs Lambda → notification SNS |

### Réseau

```
VPC 10.0.0.0/16
├── Public subnets  (×2 AZ) : 10.0.0.0/24, 10.0.1.0/24  → Internet Gateway
└── Private subnets (×2 AZ) : 10.0.100.0/24, 10.0.101.0/24 → VPC Endpoints uniquement
      ├── Lambda document-processor
      ├── Lambda api-backend
      └── Aurora cluster (RDS subnet group)
```

Aucun NAT Gateway — tout le trafic vers AWS passe par VPC endpoints privés.

---

## Structure du projet

```
.
├── frontend/                  # React 18 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx      # Formulaire de connexion Cognito
│   │   │   ├── Register.jsx   # Inscription + confirmation par code email
│   │   │   ├── UploadDocument.jsx  # Upload S3 via Cognito Identity Pool
│   │   │   └── DocumentList.jsx    # Liste + détail des documents traités
│   │   ├── App.jsx            # Routing login/register/app + handlers Cognito
│   │   ├── config.js          # Valeurs de configuration (outputs Terraform)
│   │   └── main.jsx           # Point d'entrée React
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
│   ├── outputs.tf             # URLs et IDs post-déploiement
│   ├── vpc.tf                 # VPC, subnets publics/privés, route tables
│   ├── vpc_endpoints.tf       # Endpoints S3, Textract, Secrets Manager
│   ├── s3.tf                  # Buckets documents, web-frontend, logs + policies
│   ├── cognito.tf             # User Pool, App Client, Identity Pool + IAM roles
│   ├── lambda.tf              # Fonctions Lambda + permissions + trigger S3
│   ├── database.tf            # Aurora Serverless v2 PostgreSQL
│   ├── api.tf                 # API Gateway + stage prod + CloudFront
│   ├── security.tf            # Security groups, IAM roles/policies, KMS
│   └── monitoring.tf          # CloudWatch log groups, alarme Lambda, SNS topic
│
├── lambda_payload.zip         # Artefact document-processor (généré localement)
├── api_payload.zip            # Artefact api-backend (généré localement)
└── .gitignore
```

---

## Prérequis

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configuré (`aws configure`)
- [Node.js](https://nodejs.org/) >= 18.x et npm
- Droits IAM suffisants : Lambda, RDS, S3, Cognito, CloudFront, API Gateway, VPC, KMS, IAM

---

## Déploiement complet (première fois)

### 1. Packager les Lambdas

```bash
cd lambda/document_processor
zip -r ../../lambda_payload.zip .

cd ../api_backend
zip -r ../../api_payload.zip .

cd ../..
```

### 2. Déployer l'infrastructure Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Noter les outputs affichés à la fin :

```
api_gateway_url          = "https://<id>.execute-api.us-west-2.amazonaws.com/prod"
cloudfront_url           = "https://<id>.cloudfront.net"
cognito_client_id        = "<client_id>"
cognito_identity_pool_id = "us-west-2:<uuid>"
cognito_user_pool_id     = "us-west-2_<id>"
documents_bucket         = "franchise-app-documents-dev"
```

### 3. Configurer le frontend

Mettre à jour `frontend/src/config.js` avec les valeurs des outputs :

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

### 4. Builder et déployer le frontend

```bash
cd frontend
npm install
npm run build

# Récupérer le nom du bucket web frontend
BUCKET="franchise-app-web-frontend-dev"  # ou terraform output depuis ../terraform

aws s3 sync dist/ s3://$BUCKET --delete
```

### 5. Invalider le cache CloudFront

```bash
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" --output text)

aws cloudfront create-invalidation \
  --distribution-id $DIST_ID --paths "/*"
```

L'application est accessible sur l'URL `cloudfront_url`.

---

## Initialisation de la base de données

Aurora Serverless v2 ne crée pas le schéma automatiquement. À exécuter une seule fois via RDS Query Editor (console AWS) ou depuis un bastion :

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

> Le schéma stocke trois types de données extraites par Textract : `raw_text` (texte brut ligne par ligne), `forms` (paires clé/valeur JSONB), `tables` (tableaux 2D JSONB).

---

## Mise à jour des Lambdas

Après modification du code Lambda :

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

## Mise à jour du frontend

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

## Variables Terraform

| Variable | Défaut | Description |
|---|---|---|
| `aws_region` | `us-west-2` | Région de déploiement |
| `project_name` | `franchise-app` | Préfixe de toutes les ressources |
| `environment` | `dev` | Suffixe d'environnement (`dev`, `prod`) |
| `vpc_cidr` | `10.0.0.0/16` | CIDR du VPC |

Pour déployer un environnement `prod` :

```bash
terraform apply -var="environment=prod" -var="project_name=franchise-app"
```

---

## Créer un utilisateur de test

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
  --password "MotDePasse1!" \
  --permanent
```

---

## Points d'attention connus

- **Upload S3 depuis le browser** : le SDK AWS S3 browser requiert un `Blob` comme `Body` — `Uint8Array` et `File` natif provoquent une erreur `getReader is not a function`.
- **CORS** : la méthode `OPTIONS` sur API Gateway est configurée sans authentification pour permettre le preflight. La Lambda retourne les headers `Access-Control-Allow-Methods` et `Access-Control-Allow-Headers` sur toutes les réponses.
- **Aurora Serverless v2** : utilise `engine_mode = "provisioned"` (requis pour Serverless v2), pas `serverless`. La version `16.6` est la plus récente disponible en `us-west-2` au moment du déploiement.
- **VPC sans NAT** : tout le trafic sortant des Lambdas vers AWS passe par VPC endpoints. Ajouter un NAT Gateway si une dépendance externe (internet) est nécessaire.

---

## Développement local du frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> `config.js` doit pointer vers l'API Gateway et Cognito déployés sur AWS — il n'y a pas d'émulation locale des services backend.

---

## Monitoring

- **Logs Lambda** : CloudWatch Log Groups `/aws/lambda/franchise-app-document-processor` et `/aws/lambda/franchise-app-api-backend`, rétention 14 jours
- **Alarme** : `franchise-app-lambda-errors` — se déclenche si ≥ 1 erreur Lambda en 60s → notification SNS `franchise-app-alerts-topic`
- **Abonnement aux alertes** :
```bash
aws sns subscribe \
  --topic-arn <alerts_topic_arn> \
  --protocol email \
  --notification-endpoint votre@email.com
```

---

## Destruction de l'infrastructure

```bash
cd terraform
terraform destroy
```

> Les buckets S3 doivent être vidés manuellement avant destruction si `force_destroy` n'est pas activé.

```bash
aws s3 rm s3://franchise-app-documents-dev --recursive
aws s3 rm s3://franchise-app-web-frontend-dev --recursive
aws s3 rm s3://franchise-app-logs-dev --recursive
```
