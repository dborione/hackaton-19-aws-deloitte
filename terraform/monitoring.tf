resource "aws_cloudwatch_log_group" "lambda_log_scan" {
  name              = "/aws/lambda/${aws_lambda_function.document_processor.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "lambda_log_api" {
  name              = "/aws/lambda/${aws_lambda_function.api_backend.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Cette alarme se déclenche si une fonction Lambda échoue."
  actions_enabled     = true

  dimensions = {
    FunctionName = aws_lambda_function.document_processor.function_name
  }
}

resource "aws_sns_topic" "alerts" {
  name              = "${var.project_name}-alerts-topic"
  kms_master_key_id = aws_kms_key.main.id
}
