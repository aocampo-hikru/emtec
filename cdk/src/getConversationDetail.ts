import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TableName = process.env.TABLE_NAME || 'ConversationState';

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const sessionId = event.pathParameters?.sessionId as string;
  const data = await client.send(new GetItemCommand({ TableName, Key: { sessionId: { S: sessionId } } }));
  const item = data.Item ? unmarshall(data.Item) : null;
  return {
    statusCode: 200,
    body: JSON.stringify(item)
  };
}
