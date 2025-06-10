import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { loadState, saveState, classifyIntent, fillSlots } from './slots';
import { openCase } from './sohoCrm';
import { createLead } from './slots';
import { createCheckout } from './paymentsStripe';

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const params = event.queryStringParameters || {};
  const tenantId = (params.tenantId || (event.requestContext.authorizer as any)?.jwt?.claims?.tenantId) as string || 'default';
  const body = event.body ? JSON.parse(event.body) : { text: '' };
  const sessionId = body.sessionId || params.sessionId || 'unknown';
  const text = body.text || '';

  const state = await loadState(tenantId, sessionId);
  if (!state.intent) {
    state.intent = await classifyIntent(text);
  }
  const reply = await fillSlots(state, text);

  if (state.completed) {
    if (state.intent === 'soporte') {
      const caseId = await openCase(state);
      state.slots.caseId = caseId;
    } else if (state.intent === 'ventas') {
      const leadId = await createLead(state);
      state.slots.leadId = leadId;
    }
  }

  await saveState(state);

  if (text === 'pagar') {
    const url = await createCheckout(tenantId);
    return { statusCode: 200, body: url };
  }

  return { statusCode: 200, body: reply };
}
