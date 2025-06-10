import axios from 'axios';
import { ConversationState } from './slots';

export async function openCase(state: ConversationState): Promise<string> {
  const url = process.env.SOHO_CRM_API_URL || '';
  const key = process.env.SOHO_CRM_API_KEY || '';
  const resp = await axios.post(url + '/cases', state.slots, {
    headers: { 'x-api-key': key }
  });
  return resp.data.caseId as string;
}
