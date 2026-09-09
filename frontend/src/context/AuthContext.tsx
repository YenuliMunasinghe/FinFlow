'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const Role = {
  ADMIN: 'ADMIN',
  PRESIDENT: 'PRESIDENT',
  TREASURER: 'TREASURER',
  COMMITTEE_MEMBER: 'COMMITTEE_MEMBER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];


export interface UserProfile {
  id: string;
  email: string;
  name: string;
  memberId?: string;
  role: Role;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (memberId: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, memberId?: string, role?: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored token on startup
    const storedToken = localStorage.getItem('finflow_token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (memberId: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('finflow_token', data.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, memberId?: string, role?: Role) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, memberId, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('finflow_token', data.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('finflow_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
