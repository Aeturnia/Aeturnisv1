import { useState, useEffect } from 'react'

interface ApiResponse {
  status?: string;
  message?: string;
  version?: string;
  architecture?: string;
  uptime?: number;
  timestamp?: string;
  endpoints?: Record<string, string>;
  services?: Record<string, string>;
}

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiResponse>({});
  const [authTest, setAuthTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [economyTest, setEconomyTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [characterTest, setCharacterTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [equipmentTest, setEquipmentTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [combatTest, setCombatTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [liveCombatTest, setLiveCombatTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [combatSessionId, setCombatSessionId] = useState<string>('');
  const [testMonsters, setTestMonsters] = useState<any[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<string>('');

  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('TestPass123!');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    fetchApiStatus();
    fetchTestMonsters();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    }
  };

  const fetchTestMonsters = async () => {
    try {
      const response = await fetch('/api/v1/combat/test-monsters');
      const data = await response.json();
      if (data.success && data.data?.monsters) {
        setTestMonsters(data.data.monsters);
        // Set first monster as default selection
        if (data.data.monsters.length > 0) {
          setSelectedMonster(data.data.monsters[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch test monsters:', error);
    }
  };

  const testAuth = async (action: 'register' | 'login') => {
    setAuthTest({ loading: true, response: '', success: false });
    
    try {
      const requestBody = action === 'login' 
        ? { emailOrUsername: email, password }
        : { email, username, password };
        
      const response = await fetch(`/api/v1/auth/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.data?.accessToken) {
        setAuthToken(data.data.accessToken);
        setAuthTest({
          loading: false,
          response: JSON.stringify(data, null, 2),
          success: true
        });
      } else {
        setAuthTest({
          loading: false,
          response: JSON.stringify(data, null, 2),
          success: false
        });
      }
    } catch (error) {
      setAuthTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const testEconomy = async (action: 'balance' | 'bank') => {
    if (!authToken) {
      setEconomyTest({ loading: false, response: 'Need to login first', success: false });
      return;
    }

    setEconomyTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      if (action === 'balance') {
        url = '/api/v1/currency/test-balance';
      } else if (action === 'bank') {
        url = '/api/v1/bank/test-bank';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setEconomyTest({
        loading: false,
        response: JSON.stringify(data, null, 2),
        success: response.ok
      });
    } catch (error) {
      setEconomyTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const testCharacter = async (action: 'test' | 'validate') => {
    if (!authToken) {
      setCharacterTest({ loading: false, response: 'Need to login first', success: false });
      return;
    }

    setCharacterTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      if (action === 'test') {
        url = '/api/v1/characters/test';
      } else if (action === 'validate') {
        url = '/api/v1/characters/validate-name/TestHero';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setCharacterTest({
        loading: false,
        response: JSON.stringify(data, null, 2),
        success: response.ok
      });
    } catch (error) {
      setCharacterTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const testEquipment = async (action: 'test' | 'equipment') => {
    setEquipmentTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      if (action === 'test') {
        url = '/api/v1/equipment/test';
      } else if (action === 'equipment') {
        // Use a test character ID
        url = '/api/v1/equipment/550e8400-e29b-41d4-a716-446655440000';
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setEquipmentTest({
        loading: false,
        response: JSON.stringify(data, null, 2),
        success: response.ok
      });
    } catch (error) {
      setEquipmentTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const testCombat = async (action: 'test' | 'stats' | 'resources') => {
    setCombatTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      if (action === 'test') {
        url = '/api/v1/combat/test';
      } else if (action === 'stats') {
        // Use selected test monster ID
        url = `/api/v1/combat/stats/${selectedMonster || 'goblin_weak'}`;
      } else if (action === 'resources') {
        // Use selected test monster ID
        url = `/api/v1/combat/resources/${selectedMonster || 'goblin_weak'}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      setCombatTest({
        loading: false,
        response: JSON.stringify(data, null, 2),
        success: response.ok
      });
    } catch (error) {
      setCombatTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const startLiveCombatTest = async () => {
    setLiveCombatTest({ loading: true, response: 'Starting combat session...', success: false });
    
    try {
      // Step 1: Start combat session
      const startResponse = await fetch('/api/v1/combat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          targetIds: [selectedMonster || 'goblin_weak'],
          battleType: 'pve'
        })
      });

      if (!startResponse.ok) {
        throw new Error(`Failed to start combat: ${startResponse.status}`);
      }

      const startData = await startResponse.json();
      const sessionId = startData.data?.session?.sessionId;
      
      if (!sessionId) {
        throw new Error('No session ID returned from combat start');
      }

      setCombatSessionId(sessionId);
      
      // Step 2: Get initial combat state
      const sessionResponse = await fetch(`/api/v1/combat/session/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const sessionData = await sessionResponse.json();
      
      // Format the response to show combat progression
      const combatLog = {
        "Combat Session Started": startData,
        "Initial Combat State": sessionData,
        "Combat Session ID": sessionId,
        "Next Steps": [
          "Use 'Perform Attack' to make an attack action",
          "Use 'Check Status' to see current combat state",
          "Use 'Flee Combat' to end the combat session"
        ]
      };

      setLiveCombatTest({
        loading: false,
        response: JSON.stringify(combatLog, null, 2),
        success: true
      });

    } catch (error) {
      setLiveCombatTest({
        loading: false,
        response: `Error starting live combat: ${error}`,
        success: false
      });
    }
  };

  const performCombatAction = async (actionType: 'attack' | 'defend' | 'flee') => {
    if (!combatSessionId) {
      setLiveCombatTest({
        loading: false,
        response: 'No active combat session. Start combat first.',
        success: false
      });
      return;
    }

    setLiveCombatTest({ loading: true, response: 'Performing combat action...', success: false });

    try {
      if (actionType === 'flee') {
        // Use flee endpoint
        const response = await fetch(`/api/v1/combat/flee/${combatSessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        setCombatSessionId(''); // Clear session after fleeing
        
        setLiveCombatTest({
          loading: false,
          response: JSON.stringify({
            "Action": "Flee",
            "Result": data,
            "Combat Status": "Ended"
          }, null, 2),
          success: response.ok
        });
      } else {
        // Use action endpoint
        const response = await fetch('/api/v1/combat/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            sessionId: combatSessionId,
            action: {
              type: actionType,
              targetCharId: actionType === 'attack' ? selectedMonster || 'goblin_weak' : undefined
            }
          })
        });

        const data = await response.json();
        
        // Extract combat message for plain language display
        const combatMessage = data?.data?.result?.message || 'No combat message available';
        const combatStatus = data?.data?.result?.combatStatus || 'unknown';
        
        const formattedResponse = [
          "=== COMBAT ACTION ===",
          "",
          combatMessage,
          "",
          `Combat Status: ${combatStatus.toUpperCase()}`,
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
          success: response.ok
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
      const response = await fetch(`/api/v1/combat/session/${combatSessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      setLiveCombatTest({
        loading: false,
        response: JSON.stringify({
          "Current Combat State": data,
          "Session ID": combatSessionId,
          "Status Check": new Date().toISOString()
        }, null, 2),
        success: response.ok
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
    <div className="app-container">
      <div className="header">
        <h1 className="title">
          Aeturnis Online
          <span className="status-badge">Testing Environment</span>
        </h1>
      </div>

      <div className="main-grid">
        <div className="panel">
          <h2 className="panel-title">API Status</h2>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value">{apiStatus.status || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Version:</span>
            <span className="info-value">{apiStatus.version || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Architecture:</span>
            <span className="info-value">{apiStatus.architecture || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Uptime:</span>
            <span className="info-value">{apiStatus.uptime ? `${Math.round(apiStatus.uptime)}s` : 'N/A'}</span>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Services</h2>
          <div className="info-row">
            <span className="info-label">Database:</span>
            <span className="info-value">{apiStatus.services?.database || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Redis:</span>
            <span className="info-value">{apiStatus.services?.redis || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Socket.IO:</span>
            <span className="info-value">{apiStatus.services?.socketio || 'Unknown'}</span>
          </div>
          <button className="button" onClick={fetchApiStatus}>
            Refresh Status
          </button>
        </div>
      </div>

      <div className="test-section">
        <h2 className="panel-title">API Testing</h2>
        <div className="test-grid">
          
          <div className="test-panel">
            <h3 className="test-title">Authentication</h3>
            <div className="input-group">
              <label>Email:</label>
              <input 
                className="input" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="input-group">
              <label>Username:</label>
              <input 
                className="input" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="testuser"
              />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input 
                className="input" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="TestPass123!"
              />
            </div>
            <button 
              className="button" 
              onClick={() => testAuth('register')}
              disabled={authTest.loading}
            >
              Test Register
            </button>
            <button 
              className="button" 
              onClick={() => testAuth('login')}
              disabled={authTest.loading}
            >
              Test Login
            </button>
            <div className={`response ${authTest.success ? 'success' : 'error'}`}>
              {authTest.loading ? 'Loading...' : authTest.response || 'No response yet'}
            </div>
          </div>

          <div className="test-panel">
            <h3 className="test-title">Economy System</h3>
            <p>Token: {authToken ? 'Available' : 'Need to login'}</p>
            <button 
              className="button" 
              onClick={() => testEconomy('balance')}
              disabled={economyTest.loading || !authToken}
            >
              Test Balance
            </button>
            <button 
              className="button" 
              onClick={() => testEconomy('bank')}
              disabled={economyTest.loading || !authToken}
            >
              Test Bank
            </button>
            <div className={`response ${economyTest.success ? 'success' : 'error'}`}>
              {economyTest.loading ? 'Loading...' : economyTest.response || 'No response yet'}
            </div>
          </div>

          <div className="test-panel">
            <h3 className="test-title">Character System</h3>
            <p>Token: {authToken ? 'Available' : 'Need to login'}</p>
            <button 
              className="button" 
              onClick={() => testCharacter('test')}
              disabled={characterTest.loading || !authToken}
            >
              Test Character
            </button>
            <button 
              className="button" 
              onClick={() => testCharacter('validate')}
              disabled={characterTest.loading || !authToken}
            >
              Validate Name
            </button>
            <div className={`response ${characterTest.success ? 'success' : 'error'}`}>
              {characterTest.loading ? 'Loading...' : characterTest.response || 'No response yet'}
            </div>
          </div>

          <div className="test-panel">
            <h3 className="test-title">Equipment System</h3>
            <p>Status: No authentication required</p>
            <button 
              className="button" 
              onClick={() => testEquipment('test')}
              disabled={equipmentTest.loading}
            >
              Test System
            </button>
            <button 
              className="button" 
              onClick={() => testEquipment('equipment')}
              disabled={equipmentTest.loading}
            >
              Mock Equipment
            </button>
            <div className={`response ${equipmentTest.success ? 'success' : 'error'}`}>
              {equipmentTest.loading ? 'Loading...' : equipmentTest.response || 'No response yet'}
            </div>
          </div>

          <div className="test-panel">
            <h3 className="test-title">Combat System</h3>
            <p>Status: {authToken ? 'Authenticated' : 'No authentication required for system test'}</p>
            <button 
              className="button" 
              onClick={() => testCombat('test')}
              disabled={combatTest.loading}
            >
              Test System
            </button>
            <button 
              className="button" 
              onClick={() => testCombat('stats')}
              disabled={combatTest.loading || !authToken}
            >
              Character Stats
            </button>
            <button 
              className="button" 
              onClick={() => testCombat('resources')}
              disabled={combatTest.loading || !authToken}
            >
              Resource Management
            </button>
            <div className={`response ${combatTest.success ? 'success' : 'error'}`}>
              {combatTest.loading ? 'Loading...' : combatTest.response || 'No response yet'}
            </div>
          </div>

          <div className="test-panel">
            <h3 className="test-title">Live Combat Testing</h3>
            <p>Status: {authToken ? 'Authentication Required' : 'Please login first'}</p>
            <p>Active Session: {combatSessionId || 'None'}</p>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
                Test Monster Selection:
              </label>
              <select 
                className="input"
                value={selectedMonster}
                onChange={(e) => setSelectedMonster(e.target.value)}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                {testMonsters.map(monster => (
                  <option key={monster.id} value={monster.id}>
                    {monster.name} (Level {monster.level}) - {monster.difficulty}
                  </option>
                ))}
              </select>
              {selectedMonster && (
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                  Selected: {testMonsters.find(m => m.id === selectedMonster)?.description || 'Loading monster details...'}
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <button 
                className="button" 
                onClick={startLiveCombatTest}
                disabled={liveCombatTest.loading || !authToken}
                style={{ backgroundColor: '#2a4a2a' }}
              >
                Start Combat Session
              </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <button 
                className="button" 
                onClick={() => performCombatAction('attack')}
                disabled={liveCombatTest.loading || !authToken || !combatSessionId}
                style={{ backgroundColor: '#4a2a2a' }}
              >
                Perform Attack
              </button>
              <button 
                className="button" 
                onClick={() => performCombatAction('defend')}
                disabled={liveCombatTest.loading || !authToken || !combatSessionId}
                style={{ backgroundColor: '#2a2a4a' }}
              >
                Defend
              </button>
              <button 
                className="button" 
                onClick={() => performCombatAction('flee')}
                disabled={liveCombatTest.loading || !authToken || !combatSessionId}
                style={{ backgroundColor: '#4a4a2a' }}
              >
                Flee Combat
              </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <button 
                className="button" 
                onClick={checkCombatStatus}
                disabled={liveCombatTest.loading || !authToken || !combatSessionId}
                style={{ backgroundColor: '#2a4a4a' }}
              >
                Check Status
              </button>
            </div>

            <div className={`response ${liveCombatTest.success ? 'success' : 'error'}`}>
              {liveCombatTest.loading ? 'Loading...' : liveCombatTest.response || 'Start a combat session to see live combat in action'}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App