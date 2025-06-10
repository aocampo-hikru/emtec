output "api_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
output "frontend_bucket" { value = aws_s3_bucket.frontend.bucket }
