resource "aws_s3_bucket_object" "console_artifact" {
  bucket = aws_s3_bucket.artifact.id
  key    = "console/console.zip"
  source = "${abspath(path.module)}/archives/tools-console.zip"
  etag   = filemd5("${abspath(path.module)}/archives/tools-console.zip")
}

resource "aws_codepipeline" "console_codepipeline" {
  name     = "${var.name}-console"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifact.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "S3"
      version          = "1"
      output_artifacts = ["console_output"]

      configuration = {
        S3Bucket    = aws_s3_bucket_object.console_artifact.bucket
        S3ObjectKey = aws_s3_bucket_object.console_artifact.key
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["console_output"]
      output_artifacts = ["console_build_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.codebuild_console.name
        # Env vars via this method have a stupid 1000 character limit so moved them to be rendered via a template file in the build spec yaml
        EnvironmentVariables = jsonencode([
        ])
      }
    }
  }
}
