import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signInAnonymously,
  User,
  UserCredential,
  onAuthStateChanged,
  AuthError,
  ActionCodeSettings
} from 'firebase/auth';
import { auth } from './config';

// Magic Link 설정
const actionCodeSettings: ActionCodeSettings = {
  url: window.location.origin + '/auth-callback',
  handleCodeInApp: true,
};

// Google OAuth Provider 설정
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// 인증 서비스
export const authService = {
  // Magic Link 로그인 이메일 전송
  async sendMagicLink(email: string): Promise<void> {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // 이메일을 로컬 스토리지에 저장 (확인용)
      window.localStorage.setItem('emailForSignIn', email);
      console.log('✅ Magic Link 이메일 전송 성공:', email);
    } catch (error) {
      console.error('❌ Magic Link 이메일 전송 실패:', error);
      throw error;
    }
  },

  // Magic Link로 로그인 완료
  async signInWithMagicLink(url?: string): Promise<UserCredential> {
    try {
      const currentUrl = url || window.location.href;
      
      if (!isSignInWithEmailLink(auth, currentUrl)) {
        throw new Error('유효하지 않은 로그인 링크입니다.');
      }

      let email = window.localStorage.getItem('emailForSignIn');
      
      if (!email) {
        email = window.prompt('확인을 위해 이메일 주소를 입력해주세요:');
        if (!email) {
          throw new Error('이메일이 필요합니다.');
        }
      }

      const userCredential = await signInWithEmailLink(auth, email, currentUrl);
      
      // 로컬 스토리지에서 이메일 제거
      window.localStorage.removeItem('emailForSignIn');
      
      console.log('✅ Magic Link 로그인 성공:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ Magic Link 로그인 실패:', error);
      throw error;
    }
  },

  // Google OAuth 로그인
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google 로그인 성공:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ Google 로그인 실패:', error);
      throw error;
    }
  },

  // 익명 로그인
  async signInAnonymously(): Promise<UserCredential> {
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ 익명 로그인 성공:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('❌ 익명 로그인 실패:', error);
      throw error;
    }
  },

  // 이메일/비밀번호 로그인
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ 로그인 성공:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      throw error;
    }
  },

  // 이메일/비밀번호 회원가입
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 프로필 업데이트 (displayName이 제공된 경우)
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      console.log('✅ 회원가입 성공:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      throw error;
    }
  },

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  },

  // 비밀번호 재설정 이메일 발송
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ 비밀번호 재설정 이메일 발송 성공');
    } catch (error) {
      console.error('❌ 비밀번호 재설정 이메일 발송 실패:', error);
      throw error;
    }
  },

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // 인증 상태 변경 리스너
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('로그인된 사용자가 없습니다.');
      }

      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL
      });
      
      console.log('✅ 프로필 업데이트 성공');
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw error;
    }
  }
};

// 인증 상태 관리
export class AuthStateManager {
  private unsubscribe: (() => void) | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.unsubscribe = authService.onAuthStateChanged((user) => {
      this.notifyListeners(user);
    });
  }

  // 리스너 추가
  addListener(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    
    // 즉시 현재 상태 전달
    const currentUser = authService.getCurrentUser();
    callback(currentUser);
    
    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(callback);
    };
  }

  // 모든 리스너에게 알림
  private notifyListeners(user: User | null) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('인증 상태 리스너 오류:', error);
      }
    });
  }

  // 정리
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

// 전역 인증 상태 관리자 인스턴스
export const authStateManager = new AuthStateManager();

// 에러 메시지 변환 함수
export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.';
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/weak-password':
      return '비밀번호가 너무 약합니다. (최소 6자)';
    case 'auth/invalid-email':
      return '올바르지 않은 이메일 형식입니다.';
    case 'auth/too-many-requests':
      return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해주세요.';
    case 'auth/operation-not-allowed':
      return '익명 로그인이 활성화되지 않았습니다.';
    case 'auth/admin-restricted-operation':
      return '관리자에 의해 제한된 작업입니다.';
    default:
      return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
}; 