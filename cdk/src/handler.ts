import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { loadState, saveState, classifyIntent, fillSlots, ConversationState } from './slots';
import { openCase } from './sohoCrm';
import { createLead } from './crm';
import * as qs from 'querystring';

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = qs.parse(event.body || '');
  const sessionId = body.From as string || 'unknown';
  const text = (body.Body as string) || '';

  let state = await loadState(sessionId);

  if (!state.intent) {
    state.intent = await classifyIntent(text);
  }
  const reply = await fillSlots(state, text);

  if (state.completed) {
    if (state.intent === 'soporte') {
      const caseId = await openCase(state);
      state.slots.caseId = caseId;
    } else {
      const leadId = await createLead(state);
      state.slots.leadId = leadId;
    }
  }

  await saveState(state);

  return {
    statusCode: 200,
    body: reply
  };
}
