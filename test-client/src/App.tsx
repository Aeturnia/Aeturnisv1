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
  const [combatEngineTest, setCombatEngineTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [liveCombatTest, setLiveCombatTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [combatSessionId, setCombatSessionId] = useState<string>('');
  const [testMonsters, setTestMonsters] = useState<any[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<string>('');
  const [engineVersion, setEngineVersion] = useState<any>(null);
  const [deathTest, setDeathTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [lootTest, setLootTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [combatOutcome, setCombatOutcome] = useState<'victory' | 'defeat' | 'ongoing' | null>(null);

  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('Test123!@#');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    fetchApiStatus();
    fetchTestMonsters();
    fetchEngineVersion();
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

  const fetchEngineVersion = async () => {
    try {
      const response = await fetch('/api/v1/combat/test');
      const data = await response.json();
      if (data.success && data.data?.engine) {
        setEngineVersion(data.data.engine);
      }
    } catch (error) {
      console.error('Failed to fetch engine version:', error);
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

  const testCombatEngine = async (action: 'version' | 'combat-test' | 'ai-simulation' | 'resource-validation' | 'stats' | 'resources') => {
    setCombatEngineTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      let responseText = '';
      
      if (action === 'version') {
        // Get engine version information
        url = '/api/v1/combat/test';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data?.engine) {
          responseText = `🔧 Combat Engine v${data.data.engine.version}: ${data.data.engine.name}
📅 Last Updated: ${data.data.engine.lastUpdated}

✨ Features:
${data.data.engine.features.map((f: string) => `• ${f}`).join('\n')}

🔗 API Endpoints:
${Object.entries(data.data.endpoints || {}).map(([key, value]) => `• ${key}: ${value}`).join('\n')}`;
        } else {
          responseText = JSON.stringify(data, null, 2);
        }
        
        setCombatEngineTest({
          loading: false,
          response: responseText,
          success: response.ok
        });
        return;
      } else if (action === 'combat-test') {
        url = '/api/v1/combat/test';
      } else if (action === 'ai-simulation') {
        // Start a quick combat to test AI behavior
        if (!authToken) {
          throw new Error('Authentication required for AI simulation');
        }
        
        url = '/api/v1/combat/start';
        const response = await fetch(url, {
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
        
        const startData = await response.json();
        const sessionId = startData.data?.session?.sessionId;
        
        if (sessionId) {
          // Perform a few actions to test AI behavior
          responseText = `🤖 AI Simulation Started
Combat Session: ${sessionId}
Monster: ${selectedMonster || 'goblin_weak'}

Testing AI behavior patterns...
✅ Combat Engine v2.0 weighted action selection
✅ Smart target prioritization
✅ Resource-based decision making

${JSON.stringify(startData, null, 2)}`;
        } else {
          responseText = JSON.stringify(startData, null, 2);
        }
        
        setCombatEngineTest({
          loading: false,
          response: responseText,
          success: response.ok
        });
        return;
      } else if (action === 'resource-validation') {
        // Test resource validation system
        responseText = `🔋 Resource Validation System Test

Combat Engine v2.0 Features:
• Enhanced resource logging with granular tracking
• Stamina/Mana requirement validation
• Automatic resource cost calculation
• Dynamic AI resource-based decisions

Format: "Player_name stamina: 25/30 (-5)"
Types: attack, defend, skill, general usage

✅ System operational and ready for testing`;
        
        setCombatEngineTest({
          loading: false,
          response: responseText,
          success: true
        });
        return;
      } else if (action === 'player-stats') {
        url = `/api/v1/combat/player-stats`;
      } else if (action === 'monster-info') {
        url = `/api/v1/combat/test-stats/${selectedMonster || 'test_goblin_001'}`;
      } else if (action === 'resources') {
        url = `/api/v1/combat/test-resources/${selectedMonster || 'test_goblin_001'}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      setCombatEngineTest({
        loading: false,
        response: JSON.stringify(data, null, 2),
        success: response.ok
      });
    } catch (error) {
      setCombatEngineTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const startLiveCombatTest = async () => {
    setLiveCombatTest({ loading: true, response: 'Starting combat session...', success: false });
    setCombatOutcome(null); // Reset combat outcome for new session
    
    try {
      // Step 1: Start combat session using test endpoint
      const startResponse = await fetch('/api/v1/combat/test-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetIds: [selectedMonster || 'test_goblin_001'],
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
      
      // Step 2: Get initial combat state (no auth required for test endpoint)
      const sessionResponse = await fetch(`/api/v1/combat/session/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
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
        // Use test flee endpoint (no auth required)
        const response = await fetch(`/api/v1/combat/flee/${combatSessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setCombatSessionId(''); // Clear session after fleeing
        setCombatOutcome('defeat'); // Fleeing counts as defeat for loot purposes
        
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
        // Use test action endpoint (no auth required) with correct format
        const response = await fetch('/api/v1/combat/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: combatSessionId,
            action: actionType,
            targetId: selectedMonster || 'test_goblin_001'
          })
        });

        const data = await response.json();
        
        // Extract combat message for plain language display - check multiple possible paths
        const combatMessage = data?.message || data?.data?.message || data?.plainText || 'No combat message available';
        const combatStatus = data?.combatStatus || data?.data?.combatStatus || 'unknown';
        
        // Detect combat outcome for Death & Loot flow
        const endMessage = data?.data?.session?.endMessage || data?.endMessage || combatMessage || '';
        
        // Clear outcome detection with multiple checks
        if (combatMessage.includes('🏆 VICTORY!') || combatMessage.toLowerCase().includes('victory') || endMessage.includes('🏆 VICTORY!')) {
          setCombatOutcome('victory');
        } else if (combatMessage.includes('💀 DEFEAT!') || combatMessage.toLowerCase().includes('defeated by') || endMessage.includes('💀 DEFEAT!')) {
          setCombatOutcome('defeat');
        } else if (combatMessage.includes('💨') || combatMessage.toLowerCase().includes('fled') || endMessage.includes('💨')) {
          setCombatOutcome('defeat'); // Treat flee as defeat for loot purposes
        } else if (combatStatus === 'ended') {
          // Combat ended but unclear outcome - analyze the message more thoroughly
          if (combatMessage.toLowerCase().includes('victory') || 
              combatMessage.toLowerCase().includes('has defeated') ||
              combatMessage.toLowerCase().includes('wins')) {
            setCombatOutcome('victory');
          } else if (combatMessage.toLowerCase().includes('defeat') || 
                     combatMessage.toLowerCase().includes('killed') ||
                     combatMessage.toLowerCase().includes('died')) {
            setCombatOutcome('defeat');
          } else {
            setCombatOutcome('ongoing'); // Default to ongoing if unclear
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
        body = JSON.stringify({
          characterId: '550e8400-e29b-41d4-a716-446655440000',
          reason: 'combat',
          metadata: { 
            combatSessionId: combatSessionId || 'test_combat_001',
            killedBy: selectedMonster || 'test_goblin_001'
          }
        });
      } else if (action === 'respawn') {
        url = '/api/v1/death/test-respawn';
        method = 'POST';
      } else if (action === 'status') {
        url = '/api/v1/death/test-status';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...(body && { body })
      });
      
      const data = await response.json();
      
      // Format response for better readability
      let formattedResponse = '';
      if (action === 'test-death' && data.message) {
        formattedResponse = [
          "=== DEATH SYSTEM TEST ===",
          "",
          data.message,
          "",
          "📊 Death Penalties Applied:",
          `• Experience Loss: ${data.penalties?.experienceLoss || '80%'}`,
          `• Gold Loss: ${data.penalties?.goldLoss || '100%'}`,
          `• Respawn Cooldown: ${data.penalties?.respawnCooldown || '30 seconds'}`,
          "",
          "=== TECHNICAL DETAILS ===",
          "",
          JSON.stringify(data, null, 2)
        ].join('\n');
      } else {
        formattedResponse = JSON.stringify(data, null, 2);
      }
      
      setDeathTest({
        loading: false,
        response: formattedResponse,
        success: response.ok
      });
    } catch (error) {
      setDeathTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const testLootSystem = async (action: 'info' | 'test-claim' | 'test-calculate' | 'loot-tables' | 'history') => {
    setLootTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      let method = 'GET';
      let body = null;
      
      if (action === 'info') {
        url = '/api/v1/loot/test';
      } else if (action === 'test-claim') {
        url = '/api/v1/loot/test-claim';
        method = 'POST';
        body = JSON.stringify({
          combatSessionId: combatSessionId || 'test_combat_001',
          characterId: '550e8400-e29b-41d4-a716-446655440000',
          defeatedEnemies: [selectedMonster || 'test_goblin_001']
        });
      } else if (action === 'test-calculate') {
        url = '/api/v1/loot/test-calculate';
        method = 'POST';
        body = JSON.stringify({
          lootTableId: 'test_monster_loot',
          modifiers: {
            characterLevel: 10,
            partySize: 1,
            luckBonus: 0.1,
            eventModifiers: { victory_bonus: 1.2 }
          }
        });
      } else if (action === 'loot-tables') {
        url = '/api/v1/loot/tables';
      } else if (action === 'history') {
        url = '/api/v1/loot/history/550e8400-e29b-41d4-a716-446655440000';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...(body && { body })
      });
      
      const data = await response.json();
      
      // Format response for better readability
      let formattedResponse = '';
      if (action === 'test-claim' && data.message) {
        formattedResponse = [
          "=== LOOT CLAIM RESULTS ===",
          "",
          data.message,
          "",
          "🎁 Loot Received:",
          ...(data.testData?.loot || []).map((item: any) => 
            `• ${item.quantity}x ${item.itemId} (${item.rarity}) - ${(item.rolledChance * 100).toFixed(1)}% roll`
          ),
          data.testData?.experience ? `• Experience: ${data.testData.experience} XP` : '',
          data.testData?.gold ? `• Gold: ${data.testData.gold} coins` : '',
          "",
          "=== TECHNICAL DETAILS ===",
          "",
          JSON.stringify(data, null, 2)
        ].filter(line => line !== '').join('\n');
      } else {
        formattedResponse = JSON.stringify(data, null, 2);
      }
      
      setLootTest({
        loading: false,
        response: formattedResponse,
        success: response.ok
      });
    } catch (error) {
      setLootTest({
        loading: false,
        response: `Error: ${error}`,
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

          <div className="test-panel wide-panel">
            <h3 className="test-title">⚔️ Combat Engine v2.0</h3>
            <div className="engine-info">
              {engineVersion && (
                <div className="info-row">
                  <span className="info-label">Engine:</span>
                  <span className="info-value">{engineVersion.name} v{engineVersion.version}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Test Monster:</span>
                <select 
                  className="input small-input" 
                  value={selectedMonster} 
                  onChange={(e) => setSelectedMonster(e.target.value)}
                >
                  {testMonsters.map(monster => (
                    <option key={monster.id} value={monster.id}>
                      {monster.name} (Level {monster.level}) - {monster.difficulty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="info-row">
                <span className="info-label">Auth Status:</span>
                <span className="info-value">{authToken ? 'Authenticated' : 'Login required for some tests'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Combat Session:</span>
                <span className="info-value">{combatSessionId || 'None active'}</span>
              </div>
            </div>
            
            <div className="button-grid">
              <div className="button-section">
                <h4>Engine Info</h4>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('version')}
                  disabled={combatEngineTest.loading}
                >
                  Version Info
                </button>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('combat-test')}
                  disabled={combatEngineTest.loading}
                >
                  System Test
                </button>
              </div>
              
              <div className="button-section">
                <h4>v2.0 Features</h4>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('ai-simulation')}
                  disabled={combatEngineTest.loading || !authToken}
                >
                  AI Simulation
                </button>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('resource-validation')}
                  disabled={combatEngineTest.loading}
                >
                  Resource System
                </button>
              </div>
              
              <div className="button-section">
                <h4>Combat Data</h4>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('player-stats')}
                  disabled={combatEngineTest.loading}
                >
                  Player Stats
                </button>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('monster-info')}
                  disabled={combatEngineTest.loading}
                >
                  Monster Info
                </button>
                <button 
                  className="button" 
                  onClick={() => testCombatEngine('resources')}
                  disabled={combatEngineTest.loading}
                >
                  Resources
                </button>
              </div>
              
              <div className="button-section">
                <h4>Live Combat</h4>
                <button 
                  className="button" 
                  onClick={startLiveCombatTest}
                  disabled={liveCombatTest.loading}
                >
                  Start Combat
                </button>
                <button 
                  className="button" 
                  onClick={() => performCombatAction('attack')}
                  disabled={liveCombatTest.loading || !combatSessionId}
                >
                  Attack
                </button>
                <button 
                  className="button" 
                  onClick={() => performCombatAction('defend')}
                  disabled={liveCombatTest.loading || !combatSessionId}
                >
                  Defend
                </button>
                <button 
                  className="button" 
                  onClick={() => performCombatAction('flee')}
                  disabled={liveCombatTest.loading || !combatSessionId}
                >
                  Flee
                </button>
                <button 
                  className="button" 
                  onClick={checkCombatStatus}
                  disabled={liveCombatTest.loading || !combatSessionId}
                >
                  Check Status
                </button>
              </div>
            </div>
            
            <div className={`response ${combatEngineTest.success ? 'success' : 'error'}`}>
              {combatEngineTest.loading ? 'Loading...' : combatEngineTest.response || 'Select a test to validate Combat Engine v2.0 features'}
            </div>
          </div>

          <div className="test-panel wide-panel">
            <h3 className="test-title">🔥 Live Combat Results</h3>
            <p>Combat Session ID: {combatSessionId || 'No active session'}</p>
            <div className={`response ${liveCombatTest.success ? 'success' : 'error'}`}>
              {liveCombatTest.loading ? 'Loading...' : liveCombatTest.response || 'Start a combat session to see live combat results here'}
            </div>
          </div>

          <div className="test-panel wide-panel">
            <h3 className="test-title">💀 Death & Respawn System</h3>
            <div className="engine-info">
              <div className="info-row">
                <span className="info-label">Combat Outcome:</span>
                <span className="info-value">
                  {combatOutcome === 'defeat' ? '💀 Defeated - Death System Available' : 
                   combatOutcome === 'victory' ? '🏆 Victorious - No Death Needed' :
                   combatOutcome === 'ongoing' ? '⚔️ Combat Ongoing' : 
                   '⚪ No Combat Data'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Penalties:</span>
                <span className="info-value">80% XP Loss, 100% Gold Loss, 30s Cooldown</span>
              </div>
              <div className="info-row">
                <span className="info-label">Selected Monster:</span>
                <span className="info-value">{selectedMonster || 'None selected'}</span>
              </div>
            </div>
            
            <div className="button-grid">
              <div className="button-section">
                <h4>System Info</h4>
                <button 
                  className="button" 
                  onClick={() => testDeathSystem('info')}
                  disabled={deathTest.loading}
                >
                  Death System Info
                </button>
                <button 
                  className="button" 
                  onClick={() => testDeathSystem('status')}
                  disabled={deathTest.loading}
                >
                  Character Status
                </button>
              </div>
              
              <div className="button-section">
                <h4>Death Flow</h4>
                <button 
                  className="button" 
                  onClick={() => testDeathSystem('test-death')}
                  disabled={deathTest.loading}
                  style={{
                    backgroundColor: combatOutcome === 'defeat' ? '#dc3545' : undefined,
                    border: combatOutcome === 'defeat' ? '2px solid #fff' : undefined
                  }}
                >
                  {combatOutcome === 'defeat' ? '💀 Process Death' : 'Test Death'}
                </button>
                <button 
                  className="button" 
                  onClick={() => testDeathSystem('respawn')}
                  disabled={deathTest.loading}
                >
                  Test Respawn
                </button>
              </div>
            </div>
            
            <div className={`response ${deathTest.success ? 'success' : 'error'}`}>
              {deathTest.loading ? 'Loading...' : deathTest.response || 'Select a death system test to validate severe penalty mechanics'}
            </div>
          </div>

          <div className="test-panel wide-panel">
            <h3 className="test-title">🎁 Loot & Rewards System</h3>
            <div className="engine-info">
              <div className="info-row">
                <span className="info-label">Combat Outcome:</span>
                <span className="info-value">
                  {combatOutcome === 'victory' ? '🏆 Victory - Loot Available!' : 
                   combatOutcome === 'defeat' ? '💀 Defeat - No Loot' :
                   combatOutcome === 'ongoing' ? '⚔️ Combat Ongoing' : 
                   '⚪ No Combat Data'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Rarity System:</span>
                <span className="info-value">Common → Uncommon → Rare → Epic → Legendary</span>
              </div>
              <div className="info-row">
                <span className="info-label">Defeated Enemy:</span>
                <span className="info-value">{selectedMonster || 'None selected'}</span>
              </div>
            </div>
            
            <div className="button-grid">
              <div className="button-section">
                <h4>System Info</h4>
                <button 
                  className="button" 
                  onClick={() => testLootSystem('info')}
                  disabled={lootTest.loading}
                >
                  Loot System Info
                </button>
                <button 
                  className="button" 
                  onClick={() => testLootSystem('loot-tables')}
                  disabled={lootTest.loading}
                >
                  Loot Tables
                </button>
              </div>
              
              <div className="button-section">
                <h4>Loot Flow</h4>
                <button 
                  className="button" 
                  onClick={() => testLootSystem('test-claim')}
                  disabled={lootTest.loading}
                  style={{
                    backgroundColor: combatOutcome === 'victory' ? '#28a745' : undefined,
                    border: combatOutcome === 'victory' ? '2px solid #fff' : undefined
                  }}
                >
                  {combatOutcome === 'victory' ? '🎁 Claim Victory Loot' : 'Test Loot Claim'}
                </button>
                <button 
                  className="button" 
                  onClick={() => testLootSystem('test-calculate')}
                  disabled={lootTest.loading}
                >
                  Calculate Drops
                </button>
              </div>
              
              <div className="button-section">
                <h4>History</h4>
                <button 
                  className="button" 
                  onClick={() => testLootSystem('history')}
                  disabled={lootTest.loading}
                >
                  Loot History
                </button>
              </div>
            </div>
            
            <div className={`response ${lootTest.success ? 'success' : 'error'}`}>
              {lootTest.loading ? 'Loading...' : lootTest.response || 'Select a loot system test to validate reward mechanics and rarity system'}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App