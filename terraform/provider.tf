terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Optionnel: Configuration du backend S3 (à décommenter et configurer)
  # backend "s3" {
  #   bucket         = "my-terraform-state-bucket"
  #   key            = "infra/terraform.tfstate"
  #   region         = "us-west-2"
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region
}
