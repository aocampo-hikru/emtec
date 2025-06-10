import { useEffect, useState } from 'react';
import { listConversations } from '../api';

export default function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    listConversations().then(setItems);
  }, []);
  return (
    <aside className="w-64 border-r overflow-y-auto">
      <ul>
        {items.map(item => (
          <li key={item.sessionId} className="p-2 border-b cursor-pointer" onClick={() => onSelect(item.sessionId)}>
            {item.sessionId}
          </li>
        ))}
      </ul>
    </aside>
  );
}
