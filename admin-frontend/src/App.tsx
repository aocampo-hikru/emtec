import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';
import { useState } from 'react';
import './app.css';

function App() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex h-screen">
      <ConversationList onSelect={setSelected} />
      {selected && <ConversationView sessionId={selected} />}
    </div>
  );
}

export default App;
