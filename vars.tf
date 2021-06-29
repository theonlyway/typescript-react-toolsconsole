variable "name" {
  type        = string
  default     = "ToolsConsole"
  description = "Name of the solution"
}

variable "initial_admin_email_address" {
  type        = string
  description = "Default email address for initial login to Cognito. Initial login details will be sent here"
}

variable "aws_cli_profile_name" {
  type        = string
  description = "AWS CLI profile to use for credentials if not using the default"
}

variable "vault_api_url" {
  type        = string
  description = "URL to the vault API"
}

variable "recaptcha_v2_site_key" {
  type        = string
  description = "Recaptcha v2 site key"
}

variable "oidc_discovery_url" {
  type        = string
  description = "URL for the OIDC discovery metadata"
}

variable "oidc_client_secret" {
  type        = string
  description = "Client secret for the OIDC JWT lambda"
}

variable "oidc_base_url" {
  type        = string
  description = "OIDC base URL"
}

variable "oidc_client_id" {
  type        = string
  description = "OIDC base URL"
}

variable "oidc_resource_id" {
  type        = string
  description = "OIDC resource id"
}
