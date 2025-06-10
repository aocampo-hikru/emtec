import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { invoke } from './bedrock';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TableState = process.env.TABLE_STATE!;
const TableConfig = process.env.TABLE_CONFIG!;

export interface ConversationState {
  tenantId: string;
  sessionId: string;
  intent?: string;
  slots: Record<string, string>;
  completed?: boolean;
}

interface TenantConfig {
  slots: Record<string, { required: string[] }>;
  flows: string[];
}

async function getConfig(tenantId: string): Promise<TenantConfig> {
  const data = await ddb.send(new GetCommand({ TableName: TableConfig, Key: { tenantId } }));
  if (data.Item) return data.Item as TenantConfig;
  return { slots: {}, flows: [] };
}

export async function loadState(tenantId: string, sessionId: string): Promise<ConversationState> {
  const res = await ddb.send(new GetCommand({ TableName: TableState, Key: { tenantId, sessionId } }));
  return (res.Item as ConversationState) || { tenantId, sessionId, slots: {} };
}

export async function saveState(state: ConversationState) {
  await ddb.send(new PutCommand({ TableName: TableState, Item: state }));
}

export async function classifyIntent(text: string): Promise<string> {
  const reply = await invoke(`Intención (soporte|ventas): ${text}`);
  return reply.includes('venta') ? 'ventas' : 'soporte';
}

export async function fillSlots(state: ConversationState, text: string): Promise<string> {
  const config = await getConfig(state.tenantId);
  const def = config.slots[state.intent!];
  if (!def) return 'Flujo no disponible';
  const missing = def.required.filter(k => !state.slots[k]);
  if (missing.length === 0) {
    state.completed = true;
    return 'Procesando';
  }
  const completion = await invoke(`Extrae ${missing.join(', ')} en JSON del texto: ${text}`);
  try {
    const data = JSON.parse(completion);
    for (const m of missing) if (data[m]) state.slots[m] = data[m];
  } catch {}
  const still = def.required.filter(k => !state.slots[k]);
  return still.length ? `Necesito ${still.join(', ')}` : 'Procesando';
}

export async function createLead(state: ConversationState): Promise<string> {
  const leadId = `LEAD-${Date.now()}`;
  await ddb.send(new PutCommand({ TableName: process.env.TABLE_LEADS!, Item: { tenantId: state.tenantId, leadId, ...state.slots } }));
  return leadId;
}
