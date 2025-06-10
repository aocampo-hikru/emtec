import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({});

export async function invokeBedrock(prompt: string): Promise<string> {
  const input = {
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens_to_sample: 200 })
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);
  const body = new TextDecoder().decode(response.body);
  try {
    const parsed = JSON.parse(body);
    return parsed.completion || body;
  } catch {
    return body;
  }
}
