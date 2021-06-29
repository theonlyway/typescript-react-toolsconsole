resource "aws_iam_role" "idp_post_confirm" {
  name = "${var.name}-idp_post_confirm-role"

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

data "aws_iam_policy_document" "idp_post_confirm" {
  statement {

    actions   = ["cognito-idp:AdminAddUserToGroup"]
    resources = [aws_cognito_user_pool.console.arn]
    effect    = "Allow"
  }
}

resource "aws_iam_role_policy" "idp_post_confirm" {
  name   = "${var.name}-idp_post_confirm-policy"
  role   = aws_iam_role.idp_post_confirm.id
  policy = data.aws_iam_policy_document.idp_post_confirm.json
}

resource "aws_iam_role_policy_attachment" "idp_post_confirm_lambda_exec" {
  role       = aws_iam_role.idp_post_confirm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "idp_post_confirm_lambda_policy" {
  role       = aws_iam_role.idp_post_confirm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_cloudwatch_log_group" "idp_post_confirm" {
  name              = "/aws/lambda/${aws_lambda_function.idp_post_confirm.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "idp_post_confirm" {
  filename         = "${abspath(path.module)}/archives/cognito.zip"
  function_name    = "${var.name}-idp_post_confirm"
  role             = aws_iam_role.idp_post_confirm.arn
  handler          = "post_confirm_trigger.lambda_handler"
  runtime          = "python3.8"
  timeout          = 30
  memory_size      = 128
  source_code_hash = filebase64sha256("${abspath(path.module)}/archives/cognito.zip")

  environment {
    variables = {
      LOGGING_LEVEL  = "DEBUG"
      TRUSTED_ISSUER = "${replace(var.oidc_base_url, "https://", "http://")}/services/trust"
    }
  }
}

resource "aws_lambda_permission" "allow_execution_from_user_pool" {
  statement_id  = "AllowExecutionFromUserPool"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.idp_post_confirm.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.console.arn
}
