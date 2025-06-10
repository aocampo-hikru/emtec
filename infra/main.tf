terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_dynamodb_table" "conversation_state" {
  name         = "ConversationState"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "sessionId"

  attribute { name = "tenantId"  type = "S" }
  attribute { name = "sessionId" type = "S" }
}

resource "aws_dynamodb_table" "tenant_config" {
  name         = "TenantConfig"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"

  attribute { name = "tenantId" type = "S" }
}

resource "aws_dynamodb_table" "messages" {
  name         = "Messages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sessionId"
  range_key    = "timestamp"

  attribute { name = "sessionId" type = "S" }
  attribute { name = "timestamp" type = "S" }
}

resource "aws_dynamodb_table" "leads" {
  name         = "Leads"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "leadId"

  attribute { name = "tenantId" type = "S" }
  attribute { name = "leadId"  type = "S" }
}

resource "aws_s3_bucket" "frontend" {
  bucket_prefix = "wa-admin-"
  force_destroy = true
}

resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"
  }
  enabled             = true
  default_root_object = "index.html"
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "wa-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Action = ["dynamodb:*"], Effect = "Allow", Resource = [
          aws_dynamodb_table.conversation_state.arn,
          aws_dynamodb_table.tenant_config.arn,
          aws_dynamodb_table.messages.arn,
          aws_dynamodb_table.leads.arn
      ]},
      { Action = ["bedrock:InvokeModel"], Effect = "Allow", Resource = "*" },
      { Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], Effect = "Allow", Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}

resource "aws_lambda_function" "handler" {
  function_name = "wa-handler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.main"
  runtime       = "nodejs20.x"
  filename      = "../dist/lambda.zip"
  source_code_hash = filebase64sha256("../dist/lambda.zip")
  environment {
    variables = {
      TABLE_STATE = aws_dynamodb_table.conversation_state.name
      TABLE_CONFIG = aws_dynamodb_table.tenant_config.name
      TABLE_MESSAGES = aws_dynamodb_table.messages.name
      TABLE_LEADS = aws_dynamodb_table.leads.name
    }
  }
}

resource "aws_apigatewayv2_api" "http" {
  name          = "wa-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "webhook" {
  api_id           = aws_apigatewayv2_api.http.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.handler.invoke_arn
}

resource "aws_apigatewayv2_route" "webhook" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /webhook"
  target    = "integrations/${aws_apigatewayv2_integration.webhook.id}"
}

resource "aws_lambda_permission" "allow_api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handler.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

resource "aws_cognito_user_pool" "admin" {
  name = "wa-admin"
}

resource "aws_apigatewayv2_authorizer" "admin" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "cognito"
  authorizer_type = "JWT"
  identity_sources = ["$request.header.Authorization"]
  jwt_configuration {
    audience = [aws_cognito_user_pool.admin.client_name]
    issuer   = aws_cognito_user_pool.admin.endpoint
  }
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
