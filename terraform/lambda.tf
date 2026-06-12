# Lambda pour le Scan (S3 Trigger)
resource "aws_lambda_function" "document_processor" {
  filename      = "../lambda_payload.zip"
  function_name = "${var.project_name}-document-processor"
  role          = aws_iam_role.lambda_processor_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      DB_CLUSTER_ARN = aws_rds_cluster.aurora.arn
      DB_SECRET_ARN  = aws_rds_cluster.aurora.master_user_secret[0].secret_arn
      DB_NAME        = aws_rds_cluster.aurora.database_name
    }
  }

  tags = {
    Name = "${var.project_name}-document-processor"
  }
}

# Permission pour S3 d'appeler la Lambda
resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.document_processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.documents.arn
}

# Trigger S3
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.documents.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.document_processor.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_bucket]
}

# Lambda pour le Backend API
resource "aws_lambda_function" "api_backend" {
  filename      = "../api_payload.zip"
  function_name = "${var.project_name}-api-backend"
  role          = aws_iam_role.lambda_processor_role.arn # On peut réutiliser le même ou en créer un plus restreint
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      DB_CLUSTER_ARN = aws_rds_cluster.aurora.arn
      DB_SECRET_ARN  = aws_rds_cluster.aurora.master_user_secret[0].secret_arn
      DB_NAME        = aws_rds_cluster.aurora.database_name
    }
  }

  tags = {
    Name = "${var.project_name}-api-backend"
  }
}
