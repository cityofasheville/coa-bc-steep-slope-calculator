resource "aws_iam_role" "${prog_name}-role" {
    name = "${prog_name}-role"
    assume_role_policy = file("./policy_role.json")
    tags = {
      Name          = "${prog_name}-role"
      "coa:application" = "${prog_name}"
      "coa:department"  = "information-technology"
      "coa:owner"       = "jtwilson@ashevillenc.gov"
      "coa:owner-team"  = "dev"
      Description   = "Role used by ${prog_name} lambda function."
    }
}

# Lambda Basic Execution
resource "aws_iam_role_policy_attachment" "lambda_basic-${prog_name}" {
    role        = aws_iam_role.${prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC (databases)
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
    role        = aws_iam_role.${prog_name}-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

output "${prog_name}_role_arn" {
  value = "${aws_iam_role.${prog_name}-role.arn}"
}