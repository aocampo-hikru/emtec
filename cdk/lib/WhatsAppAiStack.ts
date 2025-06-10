import { Duration, Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export class WhatsAppAiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'ConversationState', {
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY
    });

    const commonEnv = {
      SOHO_CRM_API_URL: process.env.SOHO_CRM_API_URL || '',
      SOHO_CRM_API_KEY: process.env.SOHO_CRM_API_KEY || '',
      ADMIN_API_KEY: process.env.ADMIN_API_KEY || '',
      SLOT_CONFIG_JSON: process.env.SLOT_CONFIG_JSON || ''
    };

    const handler = new lambda.Function(this, 'WhatsAppHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler.main',
      code: lambda.Code.fromAsset('dist'),
      environment: commonEnv,
      timeout: Duration.seconds(30)
    });

    const getConversations = new lambda.Function(this, 'GetConversations', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getConversations.main',
      code: lambda.Code.fromAsset('dist'),
      environment: commonEnv,
      timeout: Duration.seconds(15)
    });

    const getConversationDetail = new lambda.Function(this, 'GetConversationDetail', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getConversationDetail.main',
      code: lambda.Code.fromAsset('dist'),
      environment: commonEnv,
      timeout: Duration.seconds(15)
    });

    table.grantReadWriteData(handler);
    table.grantReadData(getConversations);
    table.grantReadData(getConversationDetail);

    const bedrockPolicy = new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    });
    handler.addToRolePolicy(bedrockPolicy);

    const api = new apigw.RestApi(this, 'Api', {});
    const webhook = api.root.addResource('webhook');
    webhook.addMethod('POST', new apigw.LambdaIntegration(handler));

    const admin = api.root.addResource('admin');
    const conv = admin.addResource('conversations');
    const convId = conv.addResource('{sessionId}');


    const apiKey = api.addApiKey('AdminApiKey');
    const usagePlan = api.addUsagePlan('UsagePlan', { throttle: { rateLimit: 5, burstLimit: 10 } });
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    const authorizer = new apigw.RequestAuthorizer(this, 'ApiKeyAuthorizer', {
      handler: new lambda.Function(this, 'ApiKeyAuthorizerFn', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(
          "exports.handler = async (event) => { return { isAuthorized: event.headers['x-api-key'] === process.env.ADMIN_API_KEY }; };"
        ),
        environment: { ADMIN_API_KEY: commonEnv.ADMIN_API_KEY }
      }),
      identitySources: [apigw.IdentitySource.header('x-api-key')]
    });
    conv.addMethod('GET', new apigw.LambdaIntegration(getConversations), {
      authorizer,
      authorizationType: apigw.AuthorizationType.CUSTOM
    });
    convId.addMethod('GET', new apigw.LambdaIntegration(getConversationDetail), {
      authorizer,
      authorizationType: apigw.AuthorizationType.CUSTOM
    });

    const bucket = new s3.Bucket(this, 'AdminFrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false
    });
    new cloudfront.CloudFrontWebDistribution(this, 'AdminFrontendDistribution', {
      originConfigs: [
        {
          s3OriginSource: { s3BucketSource: bucket },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ]
    });

    new CfnOutput(this, 'AdminFrontendBucketName', { value: bucket.bucketName });
  }
}
