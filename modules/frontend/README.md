## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_cloudfront_distribution.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution) | resource |
| [aws_cloudfront_origin_access_identity.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_origin_access_identity) | resource |
| [aws_s3_bucket.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket) | resource |
| [aws_s3_bucket_policy.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy) | resource |
| [aws_s3_bucket_public_access_block.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | KMS key arn | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Name of the solution | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_console_bucket_arn"></a> [console\_bucket\_arn](#output\_console\_bucket\_arn) | ARN of the console s3 bucket |
| <a name="output_console_bucket_id"></a> [console\_bucket\_id](#output\_console\_bucket\_id) | ID of the console s3 bucket |
| <a name="output_console_cloudfront_dist_domain"></a> [console\_cloudfront\_dist\_domain](#output\_console\_cloudfront\_dist\_domain) | Console Cloudfront distribution URL |
| <a name="output_console_cloudfront_dist_id"></a> [console\_cloudfront\_dist\_id](#output\_console\_cloudfront\_dist\_id) | Console Cloudfront distribution id |
