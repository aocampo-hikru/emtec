import { useEffect, useState } from 'react';
import { getConversation } from '../api';

export default function ConversationView({ sessionId }: { sessionId: string }) {
  const [conv, setConv] = useState<any>(null);
  useEffect(() => {
    getConversation(sessionId).then(setConv);
  }, [sessionId]);

  if (!conv) return <div className="flex-1">Loading...</div>;
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <pre>{JSON.stringify(conv, null, 2)}</pre>
    </div>
  );
}
