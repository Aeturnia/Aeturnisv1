import React, { useState, useEffect } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const CombatPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  
  const [combatEngineTest, setCombatEngineTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [liveCombatTest, setLiveCombatTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [combatSessionId, setCombatSessionId] = useState<string>('');
  const [testMonsters, setTestMonsters] = useState<any[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<string>('');
  const [engineVersion, setEngineVersion] = useState<any>(null);
  const [combatOutcome, setCombatOutcome] = useState<'victory' | 'defeat' | 'ongoing' | null>(null);

  useEffect(() => {
    fetchTestMonsters();
    fetchEngineVersion();
  }, []);

  const fetchTestMonsters = async () => {
    try {
      const result = await api.get('/api/v1/combat/test-monsters');
      console.log('Monsters API result:', result);
      if (result.success && result.data) {
        console.log('Setting monsters:', result.data);
        setTestMonsters(result.data);
        if (result.data.length > 0) {
          console.log('Setting selected monster to:', result.data[0].id);
          setSelectedMonster(result.data[0].id);
        }
      } else {
        console.error('Monster fetch failed:', result);
      }
    } catch (error) {
      console.error('Failed to fetch test monsters:', error);
    }
  };

  const fetchEngineVersion = async () => {
    try {
      const result = await api.get('/api/v1/combat/test');
      if (result.success && result.data) {
        setEngineVersion(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch engine version:', error);
    }
  };

  const testCombatEngine = async () => {
    setCombatEngineTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.get('/api/v1/combat/test');
      setCombatEngineTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
    } catch (error) {
      setCombatEngineTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const startCombat = async () => {
    if (!selectedMonster) {
      setLiveCombatTest({
        loading: false,
        response: 'Please select a monster first',
        success: false
      });
      return;
    }

    setLiveCombatTest({ loading: true, response: 'Starting combat...', success: false });
    setCombatOutcome('ongoing');

    try {
      const result = await api.post('/api/v1/combat/start', {
        playerId: 'player-test-001',
        enemyId: selectedMonster
      });

      if (result.success && result.data?.sessionId) {
        setCombatSessionId(result.data.sessionId);
        setLiveCombatTest({
          loading: false,
          response: JSON.stringify({
            "Combat Started": true,
            "Session ID": result.data.sessionId,
            "Selected Monster": testMonsters.find(m => m.id === selectedMonster)?.name || selectedMonster,
            "Combat Data": result.data
          }, null, 2),
          success: true
        });
      } else {
        setLiveCombatTest({
          loading: false,
          response: JSON.stringify(result, null, 2),
          success: false
        });
      }
    } catch (error) {
      setLiveCombatTest({
        loading: false,
        response: `Error starting combat: ${error}`,
        success: false
      });
    }
  };

  const performCombatAction = async (actionType: string) => {
    if (!combatSessionId) {
      setLiveCombatTest({
        loading: false,
        response: 'No active combat session. Start combat first.',
        success: false
      });
      return;
    }

    setLiveCombatTest({ loading: true, response: `Performing ${actionType}...`, success: false });

    try {
      const result = await api.post('/api/v1/combat/action', {
        sessionId: combatSessionId,
        action: {
          type: actionType,
          playerId: 'player-test-001'
        }
      });

      if (result.success && result.data) {
        const data = result.data;
        const combatMessage = data.combatMessage || data.message || '';
        const combatStatus = data.combatStatus || data.status || 'ongoing';
        const endMessage = data.endMessage || '';

        // Update combat outcome based on response
        if (combatStatus === 'ended') {
          if (combatMessage.toLowerCase().includes('victory') || 
              combatMessage.toLowerCase().includes('wins')) {
            setCombatOutcome('victory');
          } else if (combatMessage.toLowerCase().includes('defeat') || 
                     combatMessage.toLowerCase().includes('killed') ||
                     combatMessage.toLowerCase().includes('died')) {
            setCombatOutcome('defeat');
          } else {
            setCombatOutcome('ongoing');
          }
        } else {
          setCombatOutcome('ongoing');
        }

        const formattedResponse = [
          "=== COMBAT ACTION ===",
          "",
          combatMessage,
          "",
          `Combat Status: ${combatStatus.toUpperCase()}`,
          endMessage ? `Outcome: ${endMessage}` : "",
          "",
          "=== TECHNICAL DETAILS ===",
          "",
          JSON.stringify({
            "Action": actionType.toUpperCase(),
            "Session ID": combatSessionId,
            "Action Result": data
          }, null, 2)
        ].join('\n');
        
        setLiveCombatTest({
          loading: false,
          response: formattedResponse,
          success: result.success
        });
      }

    } catch (error) {
      setLiveCombatTest({
        loading: false,
        response: `Error performing ${actionType}: ${error}`,
        success: false
      });
    }
  };

  const checkCombatStatus = async () => {
    if (!combatSessionId) {
      setLiveCombatTest({
        loading: false,
        response: 'No active combat session. Start combat first.',
        success: false
      });
      return;
    }

    setLiveCombatTest({ loading: true, response: 'Checking combat status...', success: false });

    try {
      const result = await api.get(`/api/v1/combat/session/${combatSessionId}`);
      
      setLiveCombatTest({
        loading: false,
        response: JSON.stringify({
          "Current Combat State": result.data,
          "Session ID": combatSessionId,
          "Status Check": new Date().toISOString()
        }, null, 2),
        success: result.success
      });

    } catch (error) {
      setLiveCombatTest({
        loading: false,
        response: `Error checking combat status: ${error}`,
        success: false
      });
    }
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h2>⚡ Combat Engine v2.0</h2>
        <p>Enhanced AI & Resource Management - Test the production combat system with realistic monsters.</p>
        
        {engineVersion && (
          <div className="engine-info">
            <h4>Engine Version: {engineVersion.version || 'v2.0.0'}</h4>
            {engineVersion.features && (
              <ul>
                {engineVersion.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="grid-container">
        <div className="test-section">
          <h3>Engine Info</h3>
          <TestButton
            onClick={testCombatEngine}
            loading={combatEngineTest.loading}
            variant="primary"
          >
            Get Engine Info
          </TestButton>
          
          <ResponseViewer
            response={combatEngineTest.response}
            success={combatEngineTest.success}
            loading={combatEngineTest.loading}
            title="Combat Engine Info"
          />
        </div>

        <div className="test-section">
          <h3>Live Combat</h3>
          
          {testMonsters.length > 0 && (
            <div className="monster-selection">
              <label>Select Monster:</label>
              <select 
                value={selectedMonster} 
                onChange={(e) => setSelectedMonster(e.target.value)}
              >
                {testMonsters.map((monster) => (
                  <option key={monster.id} value={monster.id}>
                    {monster.name} (Level {monster.level})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="button-grid">
            <TestButton
              onClick={startCombat}
              loading={liveCombatTest.loading}
              variant="success"
              disabled={!selectedMonster}
            >
              Start Combat
            </TestButton>
            

            
            <TestButton
              onClick={() => performCombatAction('attack')}
              loading={liveCombatTest.loading}
              variant="danger"
              disabled={!combatSessionId}
            >
              Attack
            </TestButton>
            
            <TestButton
              onClick={() => performCombatAction('defend')}
              loading={liveCombatTest.loading}
              variant="warning"
              disabled={!combatSessionId}
            >
              Defend
            </TestButton>
            
            <TestButton
              onClick={() => performCombatAction('flee')}
              loading={liveCombatTest.loading}
              variant="secondary"
              disabled={!combatSessionId}
            >
              Flee
            </TestButton>
            
            <TestButton
              onClick={checkCombatStatus}
              loading={liveCombatTest.loading}
              variant="primary"
              disabled={!combatSessionId}
            >
              Check Status
            </TestButton>
          </div>

          {combatOutcome && combatOutcome !== 'ongoing' && (
            <div className={`combat-outcome ${combatOutcome}`}>
              Combat Result: {combatOutcome.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <ResponseViewer
        response={liveCombatTest.response}
        success={liveCombatTest.success}
        loading={liveCombatTest.loading}
        title="Live Combat Response"
      />
    </div>
  );
};