import { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TableName = process.env.TABLE_NAME || 'ConversationState';

export async function main(): Promise<APIGatewayProxyResult> {
  const data = await client.send(new ScanCommand({ TableName }));
  const items = data.Items?.map(i => unmarshall(i));
  return {
    statusCode: 200,
    body: JSON.stringify(items)
  };
}
