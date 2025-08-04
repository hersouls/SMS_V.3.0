import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser
} from '../utils/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: any }>;
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



  const handleSignInWithGoogle = async () => {
    console.log('🔑 Google 로그인 시도');
    return await signInWithGoogle();
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
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};