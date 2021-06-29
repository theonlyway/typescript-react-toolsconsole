
resource "aws_lambda_layer_version" "common" {
  filename            = "${abspath(path.module)}/archives/common.zip"
  layer_name          = "${var.name}-common"
  description         = "${var.name} common functions and libraries"
  source_code_hash    = filebase64sha256("${abspath(path.module)}/archives/common.zip")
  compatible_runtimes = ["python3.8"]
}
