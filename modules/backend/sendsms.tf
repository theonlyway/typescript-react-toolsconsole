resource "aws_iam_role" "sendsms" {
  name = "${var.name}-sendsms-role"

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

resource "aws_iam_role_policy" "sendsms" {
  name = "${var.name}-sendsms-policy"
  role = aws_iam_role.sendsms.id

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Deny",
        "Action" : "sns:Publish",
        "Resource" : "arn:aws:sns:*:*:*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "sns:Publish"
        ],
        "Resource" : "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "sendsms_lambda_exec" {
  role       = aws_iam_role.sendsms.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "sendsms_lambda_policy" {
  role       = aws_iam_role.sendsms.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_cloudwatch_log_group" "sendsms" {
  name              = "/aws/lambda/${aws_lambda_function.sendsms.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "sendsms" {
  filename      = "${abspath(path.module)}/archives/sendsms.zip"
  function_name = "${var.name}-sendsms"
  role          = aws_iam_role.sendsms.arn
  handler       = "sendsms.lambda_handler"
  runtime       = "python3.8"
  timeout       = 30
  memory_size   = 128
  layers        = [aws_lambda_layer_version.common.arn]


  source_code_hash = filebase64sha256("${abspath(path.module)}/archives/sendsms.zip")

  environment {
    variables = {
      LOGGING_LEVEL  = "DEBUG"
      TRUSTED_GROUPS = "Administrators,Allow_SMS,Staff"
      UNWRAP_URL     = "https://${var.console_cloudfront_dist_domain}/vault/unwrap/"
      SMS_SENDER_ID  = "Console"
    }
  }
}

resource "aws_lambda_permission" "sendsms" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sendsms.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.this.execution_arn}/*/*/*"
}
