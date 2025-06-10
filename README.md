# WhatsApp AI SaaS
Serverless on AWS using Terraform.

---

## ✨ Overview
This repository deploys an end-to-end solution that integrates WhatsApp with Amazon Bedrock to classify intents and fill dynamic slots. Conversations are stored in DynamoDB and can be browsed through a minimal React admin portal served from S3/CloudFront.

## 📦 Packages
- **infra** – Terraform definitions.
- **lambda** – Lambda TypeScript source.
- **admin-frontend** – React admin interface.

## 🚀 Deployment
Install dependencies and deploy with Terraform:

```bash
npm install
npm --workspace=admin-frontend run build
terraform -chdir=infra init
terraform -chdir=infra apply
```

Set environment variables such as `SOHO_CRM_URL`, `SOHO_CRM_KEY`, `STRIPE_KEY` and others in Terraform or the Lambda configuration.

The admin UI can be built with:

```bash
npm --workspace=admin-frontend run build
```

The generated files in `admin-frontend/dist` should be uploaded to the S3 bucket indicated in the stack output.

## 🧪 Tests
Run unit tests with:

```bash
npm test
```
