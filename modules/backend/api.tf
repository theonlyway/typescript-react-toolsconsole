resource "aws_api_gateway_rest_api" "this" {
  name        = var.name
  description = "API for ${var.name}"
  body = templatefile("${abspath(path.module)}/swagger.yaml", {
    gateway_name                          = var.name
    description                           = "API for ${var.name}"
    jwtRsaCustomAuthorizer_invocation_arn = aws_lambda_function.authorizer.invoke_arn
    jwtRsaCustomAuthorizer_iam_role_arn   = aws_iam_role.authorizer.arn
    hello_world_arn                       = aws_lambda_function.helloworld.invoke_arn
    send_sms_arn                          = aws_lambda_function.sendsms.invoke_arn
    vault_oidc_arn                        = aws_lambda_function.vaultoidc.invoke_arn
    vault_unwrap_arn                      = aws_lambda_function.unwrap.invoke_arn
    vault_wrap_arn                        = aws_lambda_function.wrap.invoke_arn
  })

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "this" {
  depends_on  = [aws_api_gateway_rest_api.this]
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = ""

  variables = {
    api_body_md5 = md5(file("${abspath(path.module)}/swagger.yaml"))
  }

  lifecycle {
    create_before_destroy = "true"
  }
}

resource "aws_api_gateway_stage" "this" {
  stage_name    = "console"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.this.id
}

resource "aws_api_gateway_api_key" "this" {
  name = "${var.name}-unauthenticated"
}

resource "aws_api_gateway_usage_plan" "this" {
  name = "${var.name}-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.this.id
    stage  = aws_api_gateway_stage.this.stage_name
  }

  throttle_settings {
    burst_limit = 5
    rate_limit  = 10
  }
}

resource "aws_api_gateway_usage_plan_key" "this" {
  key_id        = aws_api_gateway_api_key.this.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.this.id
}
