import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  // Persistencia de sesión
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      setUser(res.user || res);
      console.log('✅ Login exitoso:', res);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await authService.register(email, password);
      setUser(res.user || res);
      console.log('✅ Registro exitoso:', res);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así, limpiar el usuario local
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!; 