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

  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('TestPass123!');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    fetchApiStatus();
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

        </div>
      </div>
    </div>
  )
}

export default App