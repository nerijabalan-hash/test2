import { PresentationAgent } from './data/mockData';
import { AgentBuilder } from './components/AgentBuilder';

/**
 * App - Directly shows the Agent Builder for a Presentation outline.
 * No overview screen, no navigation — user starts on the creation page.
 */
export function App() {
  // Pre-filled agent with "Presentation" as the document type
  const presentationAgent: PresentationAgent = {
    id: `agent-${Date.now()}`,
    name: 'Presentation',
    type: 'custom',
    status: 'draft',
    outlineType: 'fixed',
    category: '',
    description: '',
    icon: 'document',
    targetUsers: 'All users',
    targetUserGroups: [],
    documentLayoutId: 'doc-layout-4',
    sections: [],
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };

  const handleSave = (updatedAgent: PresentationAgent) => {
    console.log('Saved agent:', updatedAgent);
  };

  return (
    <div style={{ height: '100vh' }}>
      <AgentBuilder
        initialAgent={presentationAgent}
        onBack={() => {}}
        onSave={handleSave}
        isV2Enabled={false}
      />
    </div>
  );
}

export default App;
