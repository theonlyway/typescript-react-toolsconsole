resource "aws_iam_role" "vaultoidc" {
  name = "${var.name}-vaultoidc-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": ["lambda.amazonaws.com", "apigateway.amazonaws.com"]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "vaultoidc" {
  name = "${var.name}-vaultoidc-policy"
  role = aws_iam_role.vaultoidc.id

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : [
          "secretsmanager:GetSecretValue"
        ],
        "Resource" : aws_secretsmanager_secret_version.vaultoidc.arn
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "vaultoidc_lambda_exec" {
  role       = aws_iam_role.vaultoidc.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "vaultoidc_lambda_policy" {
  role       = aws_iam_role.vaultoidc.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_cloudwatch_log_group" "vaultoidc" {
  name              = "/aws/lambda/${aws_lambda_function.vaultoidc.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "vaultoidc" {
  filename      = "${abspath(path.module)}/archives/vaultoidc.zip"
  function_name = "${var.name}-vaultoidc"
  role          = aws_iam_role.vaultoidc.arn
  handler       = "vaultoidc.lambda_handler"
  runtime       = "python3.8"
  timeout       = 30
  memory_size   = 128
  layers        = [aws_lambda_layer_version.common.arn]

  source_code_hash = filebase64sha256("${abspath(path.module)}/archives/vaultoidc.zip")

  environment {
    variables = {
      LOGGING_LEVEL      = "DEBUG"
      SECRET_NAME        = aws_secretsmanager_secret.vaultoidc.name
      OIDC_DISCOVERY_URL = var.oidc_discovery_url
      TRUSTED_GROUPS     = "Administrators,${aws_cognito_user_group.cognito_test.name},Staff"
      VAULT_API_URL      = var.vault_api_url
    }
  }
}

resource "aws_lambda_permission" "vaultoidc" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vaultoidc.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*/*"
}

locals {
  vault_client_secret = {
    client_secret = var.oidc_client_secret
  }
}

resource "aws_secretsmanager_secret" "vaultoidc" {
  name = "${var.name}/VaultOidcSecret"
}

resource "aws_secretsmanager_secret_version" "vaultoidc" {
  secret_id     = aws_secretsmanager_secret.vaultoidc.id
  secret_string = jsonencode(local.vault_client_secret)
}
