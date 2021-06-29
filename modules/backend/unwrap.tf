resource "aws_iam_role" "unwrap" {
  name = "${var.name}-unwrap-role"

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

resource "aws_iam_role_policy_attachment" "unwrap_lambda_exec" {
  role       = aws_iam_role.unwrap.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "unwrap_lambda_policy" {
  role       = aws_iam_role.unwrap.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_cloudwatch_log_group" "unwrap" {
  name              = "/aws/lambda/${aws_lambda_function.unwrap.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "unwrap" {
  filename      = "${abspath(path.module)}/archives/unwrap.zip"
  function_name = "${var.name}-unwrap"
  role          = aws_iam_role.unwrap.arn
  handler       = "unwrap.lambda_handler"
  runtime       = "python3.8"
  timeout       = 30
  memory_size   = 128
  layers        = [aws_lambda_layer_version.common.arn]

  source_code_hash = filebase64sha256("${abspath(path.module)}/archives/unwrap.zip")

  environment {
    variables = {
      LOGGING_LEVEL = "DEBUG"
      VAULT_API_URL = var.vault_api_url
    }
  }
}

resource "aws_lambda_permission" "unwrap" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.unwrap.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*/*"
}
