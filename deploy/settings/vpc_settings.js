const vpc_settings = (config) => {
return `
  vpc_config {
    subnet_ids=${JSON.stringify(config.vpc_settings.subnet_ids)}
    security_group_ids=${JSON.stringify(config.vpc_settings.security_group_ids)}
  }
`
}
export {vpc_settings};