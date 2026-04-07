import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await api.post('/api/auth/register', { name, email, phone, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
