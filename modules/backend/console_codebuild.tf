resource "aws_iam_role" "codebuild_console" {
  name = "${var.name}-codebuild-console"

  assume_role_policy = <<-EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "codebuild_console_lambda_exec" {
  role       = aws_iam_role.codebuild_console.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "codebuild_console" {
  name = "${var.name}-codebuild-console"
  role = aws_iam_role.codebuild_console.id

  policy = <<-EOF
{
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetBucketVersioning",
                "s3:GetObjectVersion",
                "s3:ListBucketVersions",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "${aws_s3_bucket.artifact.arn}",
                "${aws_s3_bucket.artifact.arn}/*",
                "${var.console_bucket_arn}",
                "${var.console_bucket_arn}/*"
            ],
            "Effect": "Allow"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "${aws_s3_bucket.artifact.arn}",
                "${var.console_bucket_arn}"
            ]
        }
    ]
}
  EOF
}

resource "aws_cloudwatch_log_group" "codebuild_console" {
  name = "${var.name}-codebuild-console"
}

resource "aws_codebuild_project" "codebuild_console" {
  name          = "${var.name}-console"
  description   = "Builds and deploys the ${var.name} console"
  build_timeout = "20"
  service_role  = aws_iam_role.codebuild_console.arn

  encryption_key = var.kms_key_arn
  artifacts {
    type = "CODEPIPELINE"
  }

  logs_config {
    cloudwatch_logs {
      status      = "ENABLED"
      group_name  = aws_cloudwatch_log_group.codebuild_console.name
      stream_name = "log-stream"
    }

    s3_logs {
      status = "DISABLED"
    }
  }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false
  }

  source {
    type = "CODEPIPELINE"
    buildspec = templatefile("${abspath(path.module)}/codebuild_buildspec_console.yaml", {
      CONSOLE_BUCKET_NAME                  = var.console_bucket_id
      ARTIFACT_BUCKET_NAME                 = aws_s3_bucket.artifact.id
      AWS_CONGITO_IDENTITY_POOL_ID         = aws_cognito_identity_pool.console.id
      AWS_COGNITO_USER_POOLS_ID            = aws_cognito_user_pool.console.id
      AWS_COGNITO_USER_POOLS_WEB_CLIENT_ID = aws_cognito_user_pool_client.console.id
      AWS_COGNITO_USER_POOLS_DOMAIN        = "${aws_cognito_user_pool_domain.console.domain}.auth.ap-southeast-2.amazoncognito.com"
      AWS_COGNITO_IDENTITY_PROVIDER        = aws_cognito_identity_provider.cognito_test.provider_name
      API_ENDPOINT                         = aws_api_gateway_stage.this.invoke_url
      CONSOLE_CLOUDFRONT_DIST_ID           = var.console_cloudfront_dist_id
      CONSOLE_URL                          = "https://${var.console_cloudfront_dist_domain}/"
      CONSOLE_URL_NO_TRAILING_SLASH        = "https://${var.console_cloudfront_dist_domain}"
      RECAPTCHA_V2_SITE_KEY                = var.recaptcha_v2_site_key
      VAULT_API_URL                        = var.vault_api_url
      CONSOLE_UNAUTH_API_KEY               = aws_api_gateway_api_key.this.value
      OIDC_BASE_URL                        = var.oidc_base_url
      OIDC_RESOURCE_ID                     = var.oidc_resource_id
      OIDC_CLIENT_ID                       = var.oidc_client_id
    })
  }
}
