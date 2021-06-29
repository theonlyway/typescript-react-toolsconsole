output "console_bucket_id" {
  value       = aws_s3_bucket.console.id
  description = "ID of the console s3 bucket"
}

output "console_bucket_arn" {
  value       = aws_s3_bucket.console.arn
  description = "ARN of the console s3 bucket"
}

output "console_cloudfront_dist_domain" {
  value       = aws_cloudfront_distribution.console.domain_name
  description = "Console Cloudfront distribution URL"
}

output "console_cloudfront_dist_id" {
  value       = aws_cloudfront_distribution.console.id
  description = "Console Cloudfront distribution id"
}
