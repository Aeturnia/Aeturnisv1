import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const AuthPanel: React.FC = () => {
  const { token, isAuthenticated, user, login, register, logout } = useAuth();
  const [authTest, setAuthTest] = useState<TestState>({ loading: false, response: '', success: false });
  
  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('Test123!@#');

  const handleLogin = async () => {
    setAuthTest({ loading: true, response: '', success: false });
    
    const result = await login(email, password);
    
    setAuthTest({
      loading: false,
      response: JSON.stringify(result, null, 2),
      success: result.success
    });
  };

  const handleRegister = async () => {
    setAuthTest({ loading: true, response: '', success: false });
    
    const result = await register(username, email, password);
    
    setAuthTest({
      loading: false,
      response: JSON.stringify(result, null, 2),
      success: result.success
    });
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h2>🔐 Authentication System</h2>
        <p>Test user registration and login functionality with JWT tokens.</p>
        
        {isAuthenticated && (
          <div className="auth-status">
            <div className="success">
              ✅ Authenticated as: {user?.username || user?.email || 'User'}
              {user?.roles && user.roles.length > 0 && (
                <span className="user-roles"> ({user.roles.join(', ')})</span>
              )}
            </div>
            <TestButton onClick={logout} variant="secondary" size="small">
              Logout
            </TestButton>
          </div>
        )}
      </div>

      <div className="grid-container">
        <div className="test-section">
          <h3>User Registration</h3>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <TestButton
            onClick={handleRegister}
            loading={authTest.loading}
            variant="primary"
          >
            Register User
          </TestButton>
        </div>

        <div className="test-section">
          <h3>User Login</h3>
          <div className="form-group">
            <label>Email/Username:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email or username"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <TestButton
            onClick={handleLogin}
            loading={authTest.loading}
            variant="success"
          >
            Login
          </TestButton>
        </div>
      </div>

      <ResponseViewer
        response={authTest.response}
        success={authTest.success}
        loading={authTest.loading}
        title="Authentication Response"
      />

      {token && (
        <div className="token-display">
          <h4>Current JWT Token:</h4>
          <div className="token-value">
            <code>{token.substring(0, 50)}...</code>
          </div>
        </div>
      )}
    </div>
  );
};