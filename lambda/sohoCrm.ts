import axios from 'axios';
import { ConversationState } from './slots';

const url = process.env.SOHO_CRM_URL || '';
const key = process.env.SOHO_CRM_KEY || '';

export async function openCase(state: ConversationState): Promise<string> {
  const resp = await axios.post(`${url}/cases`, state.slots, { headers: { 'x-api-key': key } });
  return resp.data.caseId as string;
}
