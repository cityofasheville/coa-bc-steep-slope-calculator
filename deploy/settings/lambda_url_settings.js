const lambda_url_settings = (config) => {
return `\n
resource "aws_lambda_function_url" "${config.prog_name}_url" {
  function_name = aws_lambda_function.${config.prog_name}.function_name
  authorization_type = "NONE"
}
output "${config.prog_name}_url" {
  value = aws_lambda_function_url.${config.prog_name}_url.function_url
}
`
}
export {lambda_url_settings};