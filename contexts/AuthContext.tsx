import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  confirmMagicLink,
  signInWithGoogle,
  signInAnonymously,
  signOutUser
} from '../utils/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error: any }>;
  confirmMagicLink: (url: string) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: any }>;
  signInAnonymously: () => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useFirebaseAuth();

  const handleSignIn = async (email: string, password: string) => {
    console.log('🔑 이메일 로그인 시도:', email);
    return await signInWithEmail(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    console.log('🔑 이메일 회원가입 시도:', email);
    return await signUpWithEmail(email, password);
  };

  const handleSignInWithMagicLink = async (email: string) => {
    console.log('🔑 Magic Link 로그인 시도:', email);
    return await signInWithMagicLink(email);
  };

  const handleConfirmMagicLink = async (url: string) => {
    console.log('🔑 Magic Link 확인 시도');
    return await confirmMagicLink(url);
  };

  const handleSignInWithGoogle = async () => {
    console.log('🔑 Google 로그인 시도');
    return await signInWithGoogle();
  };

  const handleSignInAnonymously = async () => {
    console.log('🔑 익명 로그인 시도');
    return await signInAnonymously();
  };

  const handleSignOut = async () => {
    console.log('🔑 로그아웃 시도');
    return await signOutUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithMagicLink: handleSignInWithMagicLink,
    confirmMagicLink: handleConfirmMagicLink,
    signInWithGoogle: handleSignInWithGoogle,
    signInAnonymously: handleSignInAnonymously,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};