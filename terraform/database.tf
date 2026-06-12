resource "aws_db_subnet_group" "rds" {
  name       = "${var.project_name}-rds-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-rds-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow inbound traffic from Lambda"
  vpc_id      = aws_vpc.main.id

  # On autorisera l'accès depuis le SG de la Lambda plus tard
  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "${var.project_name}-aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned" # Requis pour Serverless v2
  engine_version          = "16.6"
  database_name           = "franchisedb"
  master_username         = "adminuser"
  manage_master_user_password = true # AWS Secrets Manager
  db_subnet_group_name    = aws_db_subnet_group.rds.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = true
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.main.arn
  enable_http_endpoint    = true

  serverlessv2_scaling_configuration {
    max_capacity = 2.0
    min_capacity = 0.5
  }

  tags = {
    Name = "${var.project_name}-aurora-cluster"
  }
}

resource "aws_rds_cluster_instance" "aurora_instances" {
  count              = 1
  identifier         = "${var.project_name}-aurora-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}
