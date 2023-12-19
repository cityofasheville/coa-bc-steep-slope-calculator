resource "aws_iam_role" "steep_slope-role" {
    name = "steep_slope-role"
    assume_role_policy = file("./policy_role.json")
    tags = {
      Name          = "steep_slope-role"
      "coa:application" = "steep_slope"
      "coa:department"  = "information-technology"
      "coa:owner"       = "jtwilson@ashevillenc.gov"
      "coa:owner-team"  = "dev"
      Description   = "Role used by steep_slope lambda function."
    }
}

# Lambda Basic Execution
resource "aws_iam_role_policy_attachment" "lambda_basic-steep_slope" {
    role        = aws_iam_role.steep_slope-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC (databases)
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
    role        = aws_iam_role.steep_slope-role.name
    policy_arn  = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

output "steep_slope_role_arn" {
  value = "${aws_iam_role.steep_slope-role.arn}"
}