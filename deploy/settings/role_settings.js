const role_settings = (config) => {
  const output_arn = `config.aws_iam_role.${config.prog_name}-role.arn`;
return `
# Lambda Basic Execution
data "aws_iam_policy_document" "policy_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "${config.prog_name}-role" {
    name = "${config.prog_name}-role"
    assume_role_policy = data.aws_iam_policy_document.policy_role.json
    tags = {
      Name          = "${config.prog_name}-role"
      "coa:application" = "${config.prog_name}"
      "coa:department"  = "information-technology"
      "coa:owner"       = "${config.owner_tag}"
      "coa:owner-team"  = "dev"
      Description   = "Role used by ${config.prog_name} lambda function."
    }
}
resource "aws_iam_role_policy_attachment" "lambda_basic-${config.prog_name}" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

output "${config.prog_name}_role_arn" {
  value = "${output_arn}"
}
`
}
const vpc_role_settings = (config) => {
  return `
# VPC (databases)
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}
`
}
const secrets_manager_role_settings = (config) => {
  return `
# Secrets Manager
data "aws_iam_policy_document" "policy_secrets_manager" {
    statement {
        effect = "Allow"
        actions = ["secretsmanager:GetSecretValue"]
        resources = ["*"]
      }
}
resource "aws_iam_policy" "secrets_manager_policy-${config.prog_name}" {
  name        = "secrets_manager_policy-${config.prog_name}"
  description = "Read secrets"
  policy = data.aws_iam_policy_document.policy_secrets_manager.json
}
resource "aws_iam_role_policy_attachment" "secrets_manager" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = aws_iam_policy.secrets_manager_policy-${config.prog_name}.arn
}
`
}
const invoke_lambda_role_settings = (config) => {
  return `
# Invoke another Lambda
data "aws_iam_policy_document" "policy_invoke_lambda" {
    statement {
            sid = "AllowInvokeAnotherLambda"
            effect = "Allow"
            actions = ["lambda:InvokeFunction"]
            resources = ["*"]
        }
}
resource "aws_iam_policy" "invoke_lambda_policy-${config.prog_name}" {
  name        = "invoke_lambda_policy-${config.prog_name}"
  description = "Invoke another Lambda"
  policy = data.aws_iam_policy_document.policy_invoke_lambda.json
}
resource "aws_iam_role_policy_attachment" "invoke_lambda_policy-${config.prog_name}" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = aws_iam_policy.invoke_lambda_policy-${config.prog_name}.arn
}
`
}
const s3_role_settings = (config) => {
  return `
# S3
resource "aws_iam_role_policy_attachment" "lambda_s3_access-${config.prog_name}" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}
`
}
const ses_role_settings = (config) => {
  return `
# SES
resource "aws_iam_role_policy_attachment" "lambda_ses_access-${config.prog_name}" {
    role        = aws_iam_role.${config.prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}
  `
}
export { role_settings, vpc_role_settings, secrets_manager_role_settings, invoke_lambda_role_settings, s3_role_settings, ses_role_settings };