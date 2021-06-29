module "backend" {
  source = "./modules/backend"

  name                           = var.name
  initial_admin_email_address    = var.initial_admin_email_address
  aws_cli_profile_name           = var.aws_cli_profile_name
  console_bucket_id              = module.frontend.console_bucket_id
  console_bucket_arn             = module.frontend.console_bucket_arn
  console_cloudfront_dist_domain = module.frontend.console_cloudfront_dist_domain
  console_cloudfront_dist_id     = module.frontend.console_cloudfront_dist_id
  kms_key_arn                    = aws_kms_key.this.arn
  kms_key_id                     = aws_kms_key.this.id
  recaptcha_v2_site_key          = var.recaptcha_v2_site_key
  vault_api_url                  = var.vault_api_url
  oidc_discovery_url             = var.oidc_discovery_url
  oidc_client_secret             = var.oidc_client_secret
  oidc_base_url                  = var.oidc_base_url
  oidc_client_id                 = var.oidc_client_id
  oidc_resource_id               = var.oidc_resource_id
}

module "frontend" {
  source = "./modules/frontend"

  name        = var.name
  kms_key_arn = aws_kms_key.this.arn

}
