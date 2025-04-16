const api_gateway_settings = (config) => {
return `\n
resource "aws_apigatewayv2_api" "${config.prog_name}" {
  name          = "${config.prog_name}"
  protocol_type = "HTTP"
  target        = aws_lambda_function.${config.prog_name}.arn
  tags = {
    Name          = "${config.prog_name}"
    "coa:application" = "${config.prog_name}"
    "coa:department"  = "information-technology"
    "coa:owner"       = "${config.owner_tag}"
    "coa:owner-team"  = "dev"
  }
  cors_configuration {
    allow_headers     = ["*"]
    allow_methods     = ["POST", "GET"]
    allow_origins     = ["*"]
    expose_headers    = ["*"]
    max_age           = 300
  }
}

resource "aws_apigatewayv2_domain_name" "domain-name-${config.prog_name}" {
  domain_name = "${config.domain_name}"
  domain_name_configuration {
    certificate_arn = "${config.certificate_arn}"
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "apigw-map-${config.prog_name}" {
  api_id      = aws_apigatewayv2_api.${config.prog_name}.id
  domain_name = "${config.domain_name}"
  stage       = "$default"
}

resource "aws_lambda_permission" "apigw-${config.prog_name}" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.${config.prog_name}.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "\${aws_apigatewayv2_api.${config.prog_name}.execution_arn}/*/*"
}

output "${config.prog_name}_api_url" {
  value = aws_apigatewayv2_domain_name.domain-name-${config.prog_name}.domain_name
}

output "${config.prog_name}_api_id" {
  value = aws_apigatewayv2_api.${config.prog_name}.id
}
`
}
export {api_gateway_settings};
