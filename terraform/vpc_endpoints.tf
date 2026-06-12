# VPC Endpoint pour S3 (Gateway) — associé aux tables publique ET privée
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.public.id, aws_route_table.private.id]

  tags = {
    Name = "${var.project_name}-s3-endpoint"
  }
}

# VPC Endpoint pour Textract (Interface Endpoint)
resource "aws_vpc_endpoint" "textract" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.textract"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.lambda_sg.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-textract-endpoint"
  }
}

# VPC Endpoint pour Secrets Manager — requis pour que Lambda accède au secret RDS sans NAT
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.lambda_sg.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-secretsmanager-endpoint"
  }
}

# VPC Endpoint pour RDS Data API — requis pour que Lambda accède à l'API RDS Data sans NAT
resource "aws_vpc_endpoint" "rds_data" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.rds-data"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.lambda_sg.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-rds-data-endpoint"
  }
}
