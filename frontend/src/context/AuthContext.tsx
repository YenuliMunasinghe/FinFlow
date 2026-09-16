'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  society?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, memberId?: string, role?: Role) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.13.62:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('finflow_user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finflow_token');
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finflow_token');
      localStorage.removeItem('finflow_user');
      localStorage.removeItem('finflow_demo_role');
    }
  }, []);

  const switchDemoRole = useCallback((role: Role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('finflow_user', JSON.stringify(updatedUser));
      }
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('finflow_token') : null;

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    async function verifyAuth() {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setToken(storedToken);
            setUser(userData);
            setIsDemoMode(false);
            localStorage.setItem('finflow_user', JSON.stringify(userData));
          }
        } else {
          // Token expired or invalid
          if (isMounted) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('finflow_token');
            localStorage.removeItem('finflow_user');
          }
        }
      } catch {
        // Network offline / unreachable; keep cached session if available
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password || '';

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: cleanIdentifier,
          email: cleanIdentifier,
          password: cleanPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid Member ID / Email or Password.');
      }

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      setIsDemoMode(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('finflow_token', data.accessToken);
        localStorage.setItem('finflow_user', JSON.stringify(data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    memberId?: string,
    role?: Role,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          memberId: memberId?.trim(),
          role: role || Role.COMMITTEE_MEMBER,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed. Please verify your details.');
      }

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      setIsDemoMode(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('finflow_token', data.accessToken);
        localStorage.setItem('finflow_user', JSON.stringify(data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isDemoMode,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
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

