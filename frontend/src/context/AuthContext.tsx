import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  role: UserRole;
  userName: string;
  companyName: string;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    company_name?: string;
  }) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRoleState] = useState<UserRole>(() => (localStorage.getItem('role') as UserRole) || 'ADMIN');
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('user_name') || '');
  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('company_name') || '');

  const isAuthenticated = Boolean(token);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setRoleState(data.role as UserRole);
    setUserName(data.full_name);
    setCompanyName(data.company_name || 'Supply Chain Enterprise');

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user_name', data.full_name);
    localStorage.setItem('company_name', data.company_name || 'Supply Chain Enterprise');
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    company_name?: string;
  }) => {
    await api.register(payload);
    await login(payload.email, payload.password);
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    try {
      const data = await api.demoLogin(targetRole);
      setRoleState(data.role as UserRole);
      setUserName(data.full_name);
      setCompanyName(data.company_name || 'Supply Chain Enterprise');
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user_name', data.full_name);
      localStorage.setItem('company_name', data.company_name || 'Supply Chain Enterprise');
    } catch (err) {
      console.error("Failed demo login:", err);
      setRoleState(targetRole);
      setToken('demo-token-' + targetRole.toLowerCase());
      localStorage.setItem('token', 'demo-token-' + targetRole.toLowerCase());
      localStorage.setItem('role', targetRole);
      if (targetRole === 'ADMIN') {
        setUserName('Sarah Jenkins (Admin)');
        setCompanyName('AeroDynamics Global Enterprise');
      } else if (targetRole === 'PROCUREMENT') {
        setUserName('David Vance (Procurement Lead)');
        setCompanyName('AeroDynamics Procurement HQ');
      } else if (targetRole === 'SUPPLIER') {
        setUserName('Michael Chen (Apex Sales VP)');
        setCompanyName('Apex Components Ltd');
      } else {
        setUserName('Elena Rostova (Acme COO)');
        setCompanyName('Acme Industrial Solutions');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('company_name');
    setToken(null);
    setUserName('');
    setCompanyName('');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        userName,
        companyName,
        token,
        isAuthenticated,
        login,
        register,
        switchDemoRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
