variable "region" {
  type          = string
  description   = "Region in which to create resources"
}

variable "subnet_ids" {
  type          = list(string)
  description   = "Array of subnet ids"
}

variable "security_group_ids" {
  type          = list(string)
  description   = "Array of security_group_ids" 
}

variable "CONNECTSTRING" {
  type          = string
  description   = "Connection string for the database"
}

variable "prog_name" {
  type          = string
  description   = "Name of Program"
}

variable "certificate_arn" {
 type = string
 description = "API Gateway Certificate ARN"
}

variable "domain_name" {
 type = string
 description = "API Gateway Domain Name"
}