# WhatsApp AI Assistant – Support & Sales
Serverless on AWS ‧ Bedrock ‧ Twilio WhatsApp ‧ React Admin UI

---

## ✨ Overview
This repository deploys an end-to-end solution that integrates WhatsApp with Amazon Bedrock to classify intents and fill dynamic slots. Conversations are stored in DynamoDB and can be browsed through a minimal React admin portal served from S3/CloudFront.

## 📦 Packages
- **cdk** – CDK app and Lambda source code.
- **admin-frontend** – React admin interface.

## 🚀 Deployment
Install dependencies and run the CDK deploy command:

```bash
npm install
npm --workspace=cdk run build
cdk deploy
```

Set the environment variables `SOHO_CRM_API_URL`, `SOHO_CRM_API_KEY`, `ADMIN_API_KEY` and optionally `SLOT_CONFIG_JSON` before deployment.

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
