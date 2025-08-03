import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useFirebaseAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Firebase Auth 리스너 시작');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔑 인증 상태 변경:', {
        hasUser: !!user,
        uid: user?.uid,
        email: user?.email
      });
      
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('🔍 Firebase Auth 리스너 종료');
      unsubscribe();
    };
  }, []);

  return { 
    user, 
    loading, 
    isAuthenticated: !!user 
  };
};