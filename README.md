## Local development
* [Install Node.js](https://nodejs.org/en/)
* Install packages
```
cd tools-console
npm install
```
* Switch these lines around in these files so they match the below
    - [tools-console/src/index.tsx](tools-console/src/index.tsx)
    - [tools-console/src/redux/reducers/general.tsx](tools-console/src/redux/reducers/general.tsx)
```typescript
import awsConfig from './aws_config'
//declare var awsConfig: IAwsConfig;
```
* If there is no development enivonrment already setup where you can get the configuration for the template for the configuration is stored in [tools-console/aws_config.sh](tools-console/aws_config.sh). You can use that template and fill out the values yourself manually
* At the top of [tools-console/src/aws_config.tsx](tools-console/src/aws_config.tsx) put the following
```typescript
import { IAwsConfig } from './types/awsconfig'
```
* Change the line where the const is specified to the following
```typescript
export const awsConfig: IAwsConfig = {
```
* At the end of [tools-console/src/aws_config.tsx](tools-console/src/aws_config.tsx) put the following
```typescript
export default awsConfig
```
* Change the `redirectSignIn` and `redirectSignOut` values in [tools-console/src/aws_config.tsx](tools-console/src/aws_config.tsx) to the following
```
"redirectSignIn": "http://localhost:3000/",
"redirectSignOut": "http://localhost:3000/",
```
* Navigate to the development Cognito User Pool
    - Navigate to `App client settings`
    - Add `http://localhost:3000/` to both the `Callback URL(s)` and `Sign out URL(s)` and then `Save changes`
    - Be sure to remove them once done
* Start the local development server
```
npm start
```
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 0.12.4 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_backend"></a> [backend](#module\_backend) | ./modules/backend | n/a |
| <a name="module_frontend"></a> [frontend](#module\_frontend) | ./modules/frontend | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_kms_alias.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_alias) | resource |
| [aws_kms_key.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_cli_profile_name"></a> [aws\_cli\_profile\_name](#input\_aws\_cli\_profile\_name) | AWS CLI profile to use for credentials if not using the default | `string` | n/a | yes |
| <a name="input_initial_admin_email_address"></a> [initial\_admin\_email\_address](#input\_initial\_admin\_email\_address) | Default email address for initial login to Cognito. Initial login details will be sent here | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Name of the solution | `string` | `"ToolsConsole"` | no |
| <a name="input_oidc_base_url"></a> [oidc\_base\_url](#input\_oidc\_base\_url) | OIDC base URL | `string` | n/a | yes |
| <a name="input_oidc_client_id"></a> [oidc\_client\_id](#input\_oidc\_client\_id) | OIDC base URL | `string` | n/a | yes |
| <a name="input_oidc_client_secret"></a> [oidc\_client\_secret](#input\_oidc\_client\_secret) | Client secret for the OIDC JWT lambda | `string` | n/a | yes |
| <a name="input_oidc_discovery_url"></a> [oidc\_discovery\_url](#input\_oidc\_discovery\_url) | URL for the OIDC discovery metadata | `string` | n/a | yes |
| <a name="input_oidc_resource_id"></a> [oidc\_resource\_id](#input\_oidc\_resource\_id) | OIDC resource id | `string` | n/a | yes |
| <a name="input_recaptcha_v2_site_key"></a> [recaptcha\_v2\_site\_key](#input\_recaptcha\_v2\_site\_key) | Recaptcha v2 site key | `string` | n/a | yes |
| <a name="input_vault_api_url"></a> [vault\_api\_url](#input\_vault\_api\_url) | URL to the vault API | `string` | n/a | yes |

## Outputs

No outputs.
