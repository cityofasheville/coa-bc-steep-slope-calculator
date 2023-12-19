terraform {
  backend "s3" {
    bucket = "avl-tfstate-store"
    key    = "terraform/steep_slope/layer/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

# Zip file for Lambda Layer
data "archive_file" "steep_slope_layer_zip" {
  type        = "zip"
  source_dir  = "nodejs"
  output_path = "layer.zip"
}

# Lambda Layer
resource "aws_lambda_layer_version" "steep_slope_layer" {
  filename   = "layer.zip"
  source_code_hash = data.archive_file.steep_slope_layer_zip.output_base64sha256
  layer_name = "steep_slope_layer"
}

output "steep_slope_layer_arn" {
  value = aws_lambda_layer_version.steep_slope_layer.arn
}

# Zip file for Lambda Function
data "archive_file" "steep_slope_zip" {
  type        = "zip"
  source_dir  = "function/"
  output_path = "function.zip"
}

#Env vars
data "external" "env" {
  program = ["node", "--env-file=../.env", "./get-env.js"]
}


# Lambda Function
resource "aws_lambda_function" "steep_slope" {
  description      = "Lambda description" 
  function_name    = "steep_slope"
  role             = aws_iam_role.steep_slope-role.arn
  handler          = "lambda.handler"
  runtime          = "nodejs20.x"
  filename = data.archive_file.steep_slope_zip.output_path
  source_code_hash = data.archive_file.steep_slope_zip.output_base64sha256
  layers = [aws_lambda_layer_version.steep_slope_layer.arn]
  timeout          = 20
  # memory_size      = 256
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
  tags = {
    Name          = "steep_slope"
    "coa:application" = "steep_slope"
    "coa:department"  = "information-technology"
    "coa:owner"       = "jtwilson@ashevillenc.gov"
    "coa:owner-team"  = "dev"
    Description   = "Lambda description"
  }
  environment {
    variables = {
      "CONNECTSTRING": data.external.env.result.CONNECTSTRING
    }
  }
}

resource "aws_lambda_function_url" "steep_slope_url" {
  function_name      = aws_lambda_function.steep_slope.function_name
  authorization_type = "NONE"
}

output "steep_slope_arn" {
  value = aws_lambda_function.steep_slope.arn
}