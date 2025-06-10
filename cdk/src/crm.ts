import { ConversationState } from './slots';

export async function createLead(state: ConversationState): Promise<string> {
  return `LEAD-${Date.now()}`;
}
