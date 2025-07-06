import { useState, useEffect } from 'react';

interface User {
  id?: string;
  username?: string;
  email?: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: User;
  };
  message?: string;
}

export const useAuth = () => {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      // TODO: Could validate token with server here
    }
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.accessToken) {
        const accessToken = data.data.accessToken;
        setToken(accessToken);
        setIsAuthenticated(true);
        setUser(data.data.user || {});
        localStorage.setItem('authToken', accessToken);
        return data;
      } else {
        return data;
      }
    } catch (error) {
      return {
        success: false,
        message: `Login error: ${error}`,
      };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.accessToken) {
        const accessToken = data.data.accessToken;
        setToken(accessToken);
        setIsAuthenticated(true);
        setUser(data.data.user || {});
        localStorage.setItem('authToken', accessToken);
        return data;
      } else {
        return data;
      }
    } catch (error) {
      return {
        success: false,
        message: `Registration error: ${error}`,
      };
    }
  };

  const logout = () => {
    setToken('');
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return {
    token,
    isAuthenticated,
    user,
    login,
    register,
    logout,
  };
};