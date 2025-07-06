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

export const DeathPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  const [deathTest, setDeathTest] = useState<TestState>({ loading: false, response: '', success: false });

  const testDeathSystem = async (action: 'info' | 'test-death' | 'respawn' | 'status') => {
    setDeathTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      let method = 'GET';
      let body = null;
      
      if (action === 'info') {
        url = '/api/v1/death/test';
      } else if (action === 'test-death') {
        url = '/api/v1/death/test-death';
        method = 'POST';
        body = {
          characterId: '550e8400-e29b-41d4-a716-446655440000',
          damage: 150,
          source: 'Dragon Fire'
        };
      } else if (action === 'respawn') {
        url = '/api/v1/death/respawn';
        method = 'POST';
        body = {
          characterId: '550e8400-e29b-41d4-a716-446655440000',
          spawnPointId: 'town_center'
        };
      } else if (action === 'status') {
        url = '/api/v1/death/status/550e8400-e29b-41d4-a716-446655440000';
      }

      let result;
      if (method === 'POST') {
        result = await api.post(url, body);
      } else {
        result = await api.get(url);
      }
      
      setDeathTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
    } catch (error) {
      setDeathTest({
        loading: false,
        response: `Error testing death system: ${error}`,
        success: false
      });
    }
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h2>💀 Death & Respawn System</h2>
        <p>Test character death mechanics, respawn functionality, and death penalties.</p>
        
        {!isAuthenticated && (
          <div className="warning">
            ⚠️ Some death system features may require authentication
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>Death System Operations</h3>
        <div className="button-grid">
          <TestButton
            onClick={() => testDeathSystem('info')}
            loading={deathTest.loading}
            variant="primary"
          >
            System Info
          </TestButton>
          
          <TestButton
            onClick={() => testDeathSystem('test-death')}
            loading={deathTest.loading}
            variant="danger"
          >
            Simulate Death
          </TestButton>
          
          <TestButton
            onClick={() => testDeathSystem('respawn')}
            loading={deathTest.loading}
            variant="success"
          >
            Test Respawn
          </TestButton>
          
          <TestButton
            onClick={() => testDeathSystem('status')}
            loading={deathTest.loading}
            variant="secondary"
          >
            Check Death Status
          </TestButton>
        </div>

        <div className="info-section">
          <h4>Death System Features:</h4>
          <ul>
            <li>Death state tracking and persistence</li>
            <li>Configurable death penalties (XP loss, item durability)</li>
            <li>Multiple respawn locations</li>
            <li>Death event logging and statistics</li>
            <li>Soul recovery mechanics</li>
            <li>Death immunity periods</li>
          </ul>
        </div>
      </div>

      <ResponseViewer
        response={deathTest.response}
        success={deathTest.success}
        loading={deathTest.loading}
        title="Death System Response"
      />
    </div>
  );
};