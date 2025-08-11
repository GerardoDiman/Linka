import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'pending' | 'approved' | 'rejected' | 'admin';
  createdAt: string;
  leadId?: string; // ID del lead en Notion
}

interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUserStatus: (email: string) => Promise<User | null>;
  hasAccess: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Persistencia de sesión
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setHasAccess(userData.role === 'approved' || userData.role === 'admin');
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setHasAccess(user.role === 'approved' || user.role === 'admin');
    } else {
      localStorage.removeItem('user');
      setHasAccess(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 useEffect token ejecutado, token:', token ? 'Presente' : 'Ausente');
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('💾 Token guardado en localStorage');
    } else {
      localStorage.removeItem('authToken');
      console.log('🗑️ Token removido de localStorage');
    }
  }, [token]);

  const checkUserStatus = async (email: string): Promise<User | null> => {
    try {
      const response = await authService.checkUserStatus(email);
      return response.user || null;
    } catch (error) {
      console.error('❌ Error verificando estado de usuario:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      console.log('🔑 Token recibido del servidor:', res.token ? 'Presente' : 'Ausente');
      console.log('👤 Usuario recibido:', res.user);
      
      setUser(res.user);
      setToken(res.token);
      
      console.log('✅ Login exitoso:', res.user);
      console.log('💾 Guardando token en localStorage...');
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await authService.register(email, password);
      setUser(res.user);
      setToken(res.token);
      console.log('✅ Registro exitoso:', res.user);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
      setUser(null);
      setToken(null);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así, limpiar el usuario local
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, checkUserStatus, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 