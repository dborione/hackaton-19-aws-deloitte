variable "aws_region" {
  description = "Région AWS pour le déploiement"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "franchise-app"
}

variable "environment" {
  description = "Environnement (dev, prod, etc.)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block pour le VPC"
  type        = string
  default     = "10.0.0.0/16"
}
