import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import {
  getCurrentUser,
  loginUser,
  signupUser,
  logoutUser,
  switchDemoRole,
  updateProfile,
  loadDemoData as apiLoadDemoData,
  subscribeToLiveUpdates,
} from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (fullName: string, email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  isElderly: boolean;
  isCaregiver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const unsubscribe = subscribeToLiveUpdates((evt) => {
      if (evt.type === 'AUTH_STATE_CHANGED' || evt.type === 'DEMO_DATA_LOADED') {
        fetchUser();
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedIn = await loginUser(email, pass);
      setUser(loggedIn);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, pass: string, role: UserRole) => {
    setLoading(true);
    try {
      const newUser = await signupUser(fullName, email, pass, role);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const switched = await switchDemoRole(role);
      setUser(switched);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await updateProfile(user.id, updates);
    setUser(updated);
  };

  const loadDemoData = async () => {
    setLoading(true);
    try {
      await apiLoadDemoData();
      await fetchUser();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        switchRole,
        updateUserProfile,
        refreshUser: fetchUser,
        loadDemoData,
        isElderly: user?.role === 'elderly',
        isCaregiver: user?.role === 'caregiver',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
