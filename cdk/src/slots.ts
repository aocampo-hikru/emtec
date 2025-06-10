import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { defaultSlotConfig, SlotConfig } from '../config/slotConfig';
import { invokeBedrock } from './bedrock';

const tableName = process.env.TABLE_NAME || 'ConversationState';
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export interface ConversationState {
  sessionId: string;
  intent?: keyof SlotConfig;
  slots: Record<string, string>;
  completed?: boolean;
}

export async function loadState(sessionId: string): Promise<ConversationState> {
  const res = await ddb.send(new GetCommand({ TableName: tableName, Key: { sessionId } }));
  return (res.Item as ConversationState) || { sessionId, slots: {} };
}

export async function saveState(state: ConversationState) {
  await ddb.send(new PutCommand({ TableName: tableName, Item: state }));
}

function getConfig(): SlotConfig {
  if (process.env.SLOT_CONFIG_JSON) {
    try {
      return JSON.parse(process.env.SLOT_CONFIG_JSON);
    } catch {}
  }
  return defaultSlotConfig;
}

export async function classifyIntent(text: string): Promise<keyof SlotConfig> {
  const prompt = `Intención del siguiente mensaje (soporte o ventas): ${text}`;
  const result = await invokeBedrock(prompt);
  return result.includes('venta') ? 'ventas' : 'soporte';
}

export async function fillSlots(state: ConversationState, text: string): Promise<string> {
  const config = getConfig()[state.intent!];
  const missing = config.required.filter(k => !state.slots[k]);
  if (missing.length === 0) {
    state.completed = true;
    return 'Gracias, procesando...';
  }
  const prompt = `Extrae los siguientes campos del mensaje si existen: ${missing.join(', ')}. Responde JSON.`;
  const completion = await invokeBedrock(prompt + `\nMensaje: ${text}`);
  try {
    const data = JSON.parse(completion);
    for (const key of missing) {
      if (data[key]) state.slots[key] = data[key];
    }
  } catch {
    // ignore
  }
  const stillMissing = config.required.filter(k => !state.slots[k]);
  return stillMissing.length ? `Necesito ${stillMissing.join(', ')}` : 'Gracias, procesando...';
}
