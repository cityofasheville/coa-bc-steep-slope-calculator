const main_settings = (config) => {
return `\n
terraform {
  backend "s3" {
    bucket = "${config.state_bucket}"
    key    = "terraform/${config.prog_name}/terraform.tfstate"
    region = "${config.region}"
  }
}

provider "aws" {
  region = "${config.region}"
}

# Zip file for Lambda Layer
data "archive_file" "${config.prog_name}_layer_zip" {
  type        = "zip"
  source_dir  = "${config.deploy_dir}/${config.build_dir}/${config.nodejs_or_python==='nodejs'?'nodejs':'python'}"
  output_path = "${config.deploy_dir}/${config.build_dir}/layer.zip"
}

# Lambda Layer
resource "aws_lambda_layer_version" "${config.prog_name}_layer" {
  filename   = "${config.deploy_dir}/${config.build_dir}/layer.zip"
  source_code_hash = data.archive_file.${config.prog_name}_layer_zip.output_base64sha256
  layer_name = "${config.prog_name}_layer"
}

output "${config.prog_name}_layer_arn" {
  value = aws_lambda_layer_version.${config.prog_name}_layer.arn
}

# Zip file for Lambda Function
data "archive_file" "${config.prog_name}_zip" {
  type        = "zip"
  source_dir  = "${config.deploy_dir}/${config.build_dir}/funcdir"
  output_path = "${config.deploy_dir}/${config.build_dir}/function.zip"
}

# Lambda Function
resource "aws_lambda_function" "${config.prog_name}" {
  description      = "${config.description}" 
  function_name    = "${config.prog_name}"
  role             = aws_iam_role.${config.prog_name}-role.arn
  handler          = "index.handler"
  runtime          = "${config.nodejs_or_python==='nodejs'?'nodejs20.x':'python3.12'}"
  filename = data.archive_file.${config.prog_name}_zip.output_path
  source_code_hash = data.archive_file.${config.prog_name}_zip.output_base64sha256
  layers = [aws_lambda_layer_version.${config.prog_name}_layer.arn]
  timeout          = 900
  # memory_size      = 256
  ${config.vpc_settings}
  tags = {
    Name          = "${config.prog_name}"
    "coa:application" = "${config.prog_name}"
    "coa:department"  = "information-technology"
    "coa:owner"       = "${config.owner_tag}"
    "coa:owner-team"  = "dev"
    Description   = "${config.prog_name}"
  }
  environment {
    variables = {
      ${config.env_variables}
    }
  }
}

output "${config.prog_name}_arn" {
  value = aws_lambda_function.${config.prog_name}.arn
}
`
}
export {main_settings};