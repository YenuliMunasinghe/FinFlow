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

export const DEMO_USERS: Record<string, UserProfile> = {
  PRESIDENT: {
    id: 'user-pres-1',
    email: 'president@finflow.org',
    name: 'Kavinda Perera',
    memberId: 'EG/2021/8842',
    role: Role.PRESIDENT,
    society: 'Engineering Society & Rotaract Club',
  },
  TREASURER: {
    id: 'user-treas-1',
    email: 'treasurer@finflow.org',
    name: 'Senuri Silva',
    memberId: 'TR/2022/1042',
    role: Role.TREASURER,
    society: 'Engineering Society & Rotaract Club',
  },
  COMMITTEE_MEMBER: {
    id: 'user-mem-1',
    email: 'member@finflow.org',
    name: 'Malith Bandara',
    memberId: 'MEM/2023/5021',
    role: Role.COMMITTEE_MEMBER,
    society: 'Engineering Society & Rotaract Club',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (memberId: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, memberId?: string, role?: Role) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.13.62:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const storedDemoRole = localStorage.getItem('finflow_demo_role') as Role | null;
      if (storedDemoRole && DEMO_USERS[storedDemoRole]) {
        return DEMO_USERS[storedDemoRole];
      }
    }
    return DEMO_USERS.PRESIDENT;
  });

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('finflow_token');
    localStorage.removeItem('finflow_demo_role');
  }, []);

  const switchDemoRole = useCallback((role: Role) => {
    const demoUser = DEMO_USERS[role] || DEMO_USERS.PRESIDENT;
    setUser(demoUser);
    setIsDemoMode(true);
    localStorage.setItem('finflow_demo_role', role);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('finflow_token');

    if (!storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initAuth() {
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
          }
        } else {
          if (isMounted) {
            setToken(null);
            setIsDemoMode(true);
          }
        }
      } catch {
        if (isMounted) {
          setIsDemoMode(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (memberId: string, password?: string) => {
    setIsLoading(true);

    if (memberId.toUpperCase().includes('EG') || memberId.toUpperCase().includes('PRESIDENT')) {
      switchDemoRole(Role.PRESIDENT);
      setIsLoading(false);
      return;
    }
    if (memberId.toUpperCase().includes('TR') || memberId.toUpperCase().includes('TREASURER')) {
      switchDemoRole(Role.TREASURER);
      setIsLoading(false);
      return;
    }
    if (memberId.toUpperCase().includes('MEM') || memberId.toUpperCase().includes('MEMBER')) {
      switchDemoRole(Role.COMMITTEE_MEMBER);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, password: password || 'Password123!' }),
      });

      if (!response.ok) {
        setUser({
          id: `usr-${Date.now()}`,
          name: memberId.split('/')[0] || 'Society Executive',
          email: `${memberId.toLowerCase().replace(/[^a-z0-9]/g, '')}@finflow.org`,
          memberId: memberId,
          role: Role.PRESIDENT,
          society: 'Engineering Society & Rotaract Club',
        });
        setIsDemoMode(true);
        return;
      }

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      setIsDemoMode(false);
      localStorage.setItem('finflow_token', data.accessToken);
    } catch {
      setUser({
        id: `usr-${Date.now()}`,
        name: 'Society Member',
        email: `${memberId.toLowerCase().replace(/[^a-z0-9]/g, '')}@finflow.org`,
        memberId: memberId,
        role: Role.PRESIDENT,
        society: 'Engineering Society & Rotaract Club',
      });
      setIsDemoMode(true);
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

      if (!response.ok) {
        setUser({
          id: `usr-${Date.now()}`,
          name,
          email,
          memberId: memberId || 'EG/2024/9901',
          role: role || Role.COMMITTEE_MEMBER,
          society: 'Engineering Society & Rotaract Club',
        });
        setIsDemoMode(true);
        return;
      }

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      setIsDemoMode(false);
      localStorage.setItem('finflow_token', data.accessToken);
    } catch {
      setUser({
        id: `usr-${Date.now()}`,
        name,
        email,
        memberId: memberId || 'EG/2024/9901',
        role: role || Role.COMMITTEE_MEMBER,
        society: 'Engineering Society & Rotaract Club',
      });
      setIsDemoMode(true);
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
