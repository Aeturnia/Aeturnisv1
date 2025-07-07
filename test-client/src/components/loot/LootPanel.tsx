import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const LootPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  const [lootTest, setLootTest] = useState<TestState>({ loading: false, response: '', success: false });

  const testLootSystem = async (action: 'info' | 'generate' | 'table' | 'drop') => {
    setLootTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      let method = 'GET';
      let body = null;
      
      if (action === 'info') {
        url = '/api/v1/loot/test';
      } else if (action === 'generate') {
        url = '/api/v1/loot/generate';
        method = 'POST';
        body = {
          sourceType: 'monster',
          sourceId: 'goblin_warrior',
          playerLevel: 15,
          lootTableId: 'basic_monster_loot'
        };
      } else if (action === 'table') {
        url = '/api/v1/loot/table/basic_monster_loot';
      } else if (action === 'drop') {
        url = '/api/v1/loot/drop';
        method = 'POST';
        body = {
          characterId: '550e8400-e29b-41d4-a716-446655440000',
          position: { x: 100, y: 0, z: 50 },
          items: [
            { id: 'sword_iron', quantity: 1 },
            { id: 'gold_coins', quantity: 25 }
          ]
        };
      }

      let result;
      if (method === 'POST') {
        result = await api.post(url, body);
      } else {
        result = await api.get(url);
      }
      
      setLootTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
    } catch (error) {
      setLootTest({
        loading: false,
        response: `Error testing loot system: ${error}`,
        success: false
      });
    }
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h2>🎁 Loot & Rewards System</h2>
        <p>Test loot generation, drop mechanics, and reward tables for monster kills and quest completion.</p>
        
        {!isAuthenticated && (
          <div className="warning">
            ⚠️ Some loot system features may require authentication
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>Loot System Operations</h3>
        <div className="button-grid">
          <TestButton
            onClick={() => testLootSystem('info')}
            loading={lootTest.loading}
            variant="primary"
          >
            System Info
          </TestButton>
          
          <TestButton
            onClick={() => testLootSystem('generate')}
            loading={lootTest.loading}
            variant="success"
          >
            Generate Loot
          </TestButton>
          
          <TestButton
            onClick={() => testLootSystem('table')}
            loading={lootTest.loading}
            variant="secondary"
          >
            View Loot Table
          </TestButton>
          
          <TestButton
            onClick={() => testLootSystem('drop')}
            loading={lootTest.loading}
            variant="warning"
          >
            Test Item Drop
          </TestButton>
        </div>

        <div className="info-section">
          <h4>Loot System Features:</h4>
          <ul>
            <li>Dynamic loot generation based on player level</li>
            <li>Configurable loot tables with rarity distribution</li>
            <li>Item drop mechanics with position tracking</li>
            <li>Loot persistence and pickup functionality</li>
            <li>Rare item chance calculations</li>
            <li>Group loot distribution options</li>
          </ul>
        </div>
      </div>

      <ResponseViewer
        response={lootTest.response}
        success={lootTest.success}
        loading={lootTest.loading}
        title="Loot System Response"
      />
    </div>
  );
};