import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({});

export async function invoke(prompt: string): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens_to_sample: 200 })
  });
  const res = await client.send(command);
  return new TextDecoder().decode(res.body);
}
