import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';
import { useState } from 'react';
import { createCheckout } from './api';
import './app.css';

function App() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex h-screen">
      <ConversationList onSelect={setSelected} />
      <div className="flex-1 flex flex-col">
        {selected && <ConversationView sessionId={selected} />}
        <button className="m-2 p-2 bg-blue-500 text-white" onClick={() => createCheckout()}>Suscribirse</button>
      </div>
    </div>
  );
}

export default App;
