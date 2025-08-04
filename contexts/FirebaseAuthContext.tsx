import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService, authStateManager } from '../utils/firebase/auth';
import { api } from '../utils/firebase/functions';

// Context 타입 정의
interface FirebaseAuthContextType {
  user: User | null;
  userProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Context 생성
const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

// Context Provider Props
interface FirebaseAuthProviderProps {
  children: ReactNode;
}

// Firebase Auth Provider 컴포넌트
export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 프로필 로드
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const profile = await api.user.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
      // 프로필이 없으면 기본 프로필 생성
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        stats: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalMonthlyPayment: 0
        }
      });
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = authStateManager.addListener(async (firebaseUser) => {
      console.log('🔄 Firebase 인증 상태 변경:', firebaseUser?.email || 'null');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // 이메일/비밀번호 로그인
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await authService.signInWithEmail(email, password);
      return { success: true };
    } catch (error: any) {
      console.error('로그인 실패:', error);
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // Google OAuth 로그인
  const loginWithGoogle = async (): Promise<void> => {
    await authService.signInWithGoogle();
  };

  // 회원가입
  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    await authService.signUpWithEmail(email, password, displayName);
  };

  // 로그아웃
  const logout = async (): Promise<void> => {
    await authService.signOut();
  };

  // 프로필 업데이트
  const updateProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    await authService.updateUserProfile(displayName, photoURL);
    
    // 로컬 상태도 업데이트
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        displayName: displayName || prev?.displayName,
        photoURL: photoURL || prev?.photoURL
      }));
    }
  };

  // 프로필 새로고침
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// Hook for using Firebase Auth context
export function useFirebaseAuth(): FirebaseAuthContextType {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

// 기존 useApp과의 호환성을 위한 export
export const useApp = useFirebaseAuth;