resource "aws_s3_bucket" "console" {
  bucket_prefix = "${lower(var.name)}-"
  acl           = "private"
  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning {
    enabled = true
  }

  lifecycle_rule {
    id      = "default"
    enabled = true

    noncurrent_version_expiration {
      days = 1
      
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "console" {
  depends_on = [aws_s3_bucket.console]
  bucket     = aws_s3_bucket.console.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "console" {
  depends_on = [aws_s3_bucket.console]
  bucket     = aws_s3_bucket.console.id

  policy = <<POLICY
{
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "${aws_cloudfront_origin_access_identity.console.iam_arn}"
            },
            "Action": "s3:GetObject",
            "Resource": "${aws_s3_bucket.console.arn}/*"
        }
    ]
}
POLICY
}
