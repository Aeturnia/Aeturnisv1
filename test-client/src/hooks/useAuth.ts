import { useState, useEffect } from 'react';

interface User {
  id?: string;
  username?: string;
  email?: string;
  roles?: string[];
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

  const extractUserFromToken = (accessToken: string): User => {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return {
        id: payload.userId,
        username: payload.username || payload.email,
        email: payload.email,
        roles: payload.roles || ['user']
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return {};
    }
  };

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      setUser(extractUserFromToken(savedToken));
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
        setUser(extractUserFromToken(accessToken));
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
        setUser(extractUserFromToken(accessToken));
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