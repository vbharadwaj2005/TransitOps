import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => ({ success: false }),
  logout: () => {},
  hasRole: () => false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('transitops_token');
    const storedUser = localStorage.getItem('transitops_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: accessToken, user: userData } = response.data;
      localStorage.setItem('transitops_token', accessToken);
      localStorage.setItem('transitops_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
