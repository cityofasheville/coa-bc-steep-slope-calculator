terraform {
  backend "s3" {
    bucket = "avl-tfstate-store"
    key    = "terraform/${prog_name}/layer/terraform.tfstate"
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

# Lambda Function
resource "aws_lambda_function" "${prog_name}" {
  description      = "${prog_name}" 
  function_name    = "${prog_name}"
  role             = aws_iam_role.${prog_name}-role.arn
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
    Name          = "${prog_name}"
    "coa:application" = "${prog_name}"
    "coa:department"  = "information-technology"
    "coa:owner"       = "jtwilson@ashevillenc.gov"
    "coa:owner-team"  = "dev"
    Description   = "${prog_name}"
  }
  environment {
    variables = {
      "CONNECTSTRING": var.CONNECTSTRING
    }
  }
}

resource "aws_lambda_function_url" "steep_slope_url" {
  function_name      = aws_lambda_function.${prog_name}.function_name
  authorization_type = "NONE"
}

output "steep_slope_arn" {
  value = aws_lambda_function.${prog_name}.arn
}