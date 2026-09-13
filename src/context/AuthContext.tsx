'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '@/lib/db/types';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  branch_code?: string | null;
  academic_year?: string | null;
  year_number?: number | null;
  semester_number?: number | null;
  pattern?: string | null;
  target_sgpa?: number | null;
  university?: string | null;
  college_name?: string | null;
  backlog_subjects_json?: string | null;
  avatar_url?: string | null;
}

export interface StudentOnboardingData {
  university?: string;
  college_name?: string;
  department?: string;
  branch_code?: string;
  academic_year?: string;
  year_number?: number;
  semester_number?: number;
  pattern?: string;
  target_sgpa?: number;
  backlog_subjects?: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    onboarding?: StudentOnboardingData,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; resetToken?: string; error?: string }>;
  confirmPasswordReset: (token: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithGoogle: (redirect?: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.user) {
          setUser(json.data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Failed to authenticate. Please check your credentials.',
        };
      }

      if (json.data?.user) {
        setUser(json.data.user);
        return { success: true, user: json.data.user };
      }

      return { success: false, error: 'Unexpected response from server' };
    } catch {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    onboarding?: StudentOnboardingData,
    role: UserRole = 'STUDENT'
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
          university: onboarding?.university,
          college_name: onboarding?.college_name,
          department: onboarding?.department,
          branch_code: onboarding?.branch_code,
          academic_year: onboarding?.academic_year,
          year_number: onboarding?.year_number,
          semester_number: onboarding?.semester_number,
          pattern: onboarding?.pattern,
          target_sgpa: onboarding?.target_sgpa,
          backlog_subjects: onboarding?.backlog_subjects,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Failed to create account.',
        };
      }

      if (json.data?.user) {
        setUser(json.data.user);
        return { success: true, user: json.data.user };
      }

      return { success: false, error: 'Unexpected response from server' };
    } catch {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Failed to process request.',
        };
      }

      return {
        success: true,
        message: json.data?.message,
        resetToken: json.data?.resetToken,
      };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || 'Failed to reset password.',
        };
      }

      return { success: true, message: json.data?.message };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const loginWithGoogle = (redirect = '/dashboard') => {
    window.location.href = `/api/auth/oauth/google?redirect=${encodeURIComponent(redirect)}`;
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        signup,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        loginWithGoogle,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
