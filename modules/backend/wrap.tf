resource "aws_iam_role" "wrap" {
  name = "${var.name}-wrap-role"

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

resource "aws_iam_role_policy_attachment" "wrap_lambda_exec" {
  role       = aws_iam_role.wrap.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "wrap_lambda_policy" {
  role       = aws_iam_role.wrap.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_cloudwatch_log_group" "wrap" {
  name              = "/aws/lambda/${aws_lambda_function.wrap.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "wrap" {
  filename      = "${abspath(path.module)}/archives/wrap.zip"
  function_name = "${var.name}-wrap"
  role          = aws_iam_role.wrap.arn
  handler       = "wrap.lambda_handler"
  runtime       = "python3.8"
  timeout       = 30
  memory_size   = 128
  layers        = [aws_lambda_layer_version.common.arn]

  source_code_hash = filebase64sha256("${abspath(path.module)}/archives/wrap.zip")

  environment {
    variables = {
      LOGGING_LEVEL  = "DEBUG"
      VAULT_API_URL  = var.vault_api_url
      TRUSTED_GROUPS = "Administrators,Allow_Wrap,Staff"

    }
  }
}

resource "aws_lambda_permission" "wrap" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.wrap.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*/*"
}
