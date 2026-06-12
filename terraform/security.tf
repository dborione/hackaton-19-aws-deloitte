# Security Groups pour les Lambdas
resource "aws_security_group" "lambda_sg" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS from within VPC (for VPC endpoints)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-sg"
  }
}

# Autoriser RDS à recevoir du trafic de la Lambda
resource "aws_security_group_rule" "rds_ingress" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.lambda_sg.id
}

# IAM Role pour Lambda de Traitement (S3 -> Textract -> RDS)
resource "aws_iam_role" "lambda_processor_role" {
  name = "${var.project_name}-lambda-processor-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Policies pour Textract et S3
resource "aws_iam_role_policy_attachment" "lambda_textract" {
  role       = aws_iam_role.lambda_processor_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonTextractFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda_processor_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

# Permission de suppression des fichiers après traitement
resource "aws_iam_role_policy" "lambda_s3_delete" {
  name = "s3-delete-after-processing"
  role = aws_iam_role.lambda_processor_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:DeleteObject"
      Resource = "${aws_s3_bucket.documents.arn}/*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_processor_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Policy inline pour accès Secrets Manager (secret RDS) et RDS Data API
resource "aws_iam_role_policy" "lambda_secrets_rds" {
  name = "secrets-rds-policy"
  role = aws_iam_role.lambda_processor_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_rds_cluster.aurora.master_user_secret[0].secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement",
          "rds-data:BeginTransaction",
          "rds-data:CommitTransaction",
          "rds-data:RollbackTransaction"
        ]
        Resource = aws_rds_cluster.aurora.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.main.arn
      }
    ]
  })
}

# KMS Key pour le chiffrement des données (S3 & RDS)
resource "aws_kms_key" "main" {
  description             = "KMS key for encrypting documents and database"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-main-key"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/${var.project_name}-main-key"
  target_key_id = aws_kms_key.main.key_id
}
