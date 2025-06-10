# WhatsApp AI Assistant – Support & Sales  
Serverless on AWS ‧ Bedrock ‧ Twilio WhatsApp ‧ React Admin UI

---

## ✨ Overview
This repository deploys an end-to-end solution that:

| Layer | Tech | Purpose |
|-------|------|---------|
| **Messaging** | Twilio WhatsApp → API Gateway | Receives customer messages via webhook |
| **LLM Orchestration** | AWS Lambda + LangChain + **Amazon Bedrock** | Classifies intent (Soporte / Ventas) and does slot-filling |
| **State** | DynamoDB (`ConversationState`) | Persists conversation context + message log |
| **Integrations** | SOHO CRM (REST) • Lead mock | Creates casos de servicio o leads |
| **Admin API** | API Gateway (x-api-key) | Lists & fetches conversations for the UI |
| **Admin UI** | React 18 + Vite → S3 + CloudFront | Allows internal users to browse chats |
| **IaC** | AWS CDK (v2, TypeScript) | Defines all cloud resources |
| **CI / Tests** | Jest + npm scripts | Basic unit tests for Lambdas |

Architecture diagram (simplified):

