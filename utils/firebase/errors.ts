import { AuthError } from 'firebase/auth';
import { FirestoreError } from 'firebase/firestore';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
}

// Firebase Auth 에러 코드 매핑
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': '등록되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
  'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
  'auth/user-disabled': '비활성화된 계정입니다. 고객센터에 문의해주세요.',
  'auth/too-many-requests': '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/operation-not-allowed': '허용되지 않은 인증 방법입니다.',
  'auth/account-exists-with-different-credential': '다른 로그인 방법으로 가입된 계정입니다.',
  'auth/invalid-credential': '잘못된 인증 정보입니다.',
  'auth/credential-already-in-use': '이미 다른 계정에서 사용 중인 인증 정보입니다.',
  'auth/invalid-verification-code': '잘못된 인증 코드입니다.',
  'auth/invalid-verification-id': '잘못된 인증 ID입니다.',
  'auth/missing-verification-code': '인증 코드를 입력해주세요.',
  'auth/missing-verification-id': '인증 ID가 누락되었습니다.',
  'auth/code-expired': '인증 코드가 만료되었습니다.',
  'auth/invalid-phone-number': '잘못된 전화번호 형식입니다.',
  'auth/missing-phone-number': '전화번호를 입력해주세요.',
  'auth/quota-exceeded': 'SMS 발송 한도를 초과했습니다.',
  'auth/cancelled-popup-request': '팝업이 취소되었습니다.',
  'auth/popup-blocked': '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
  'auth/popup-closed-by-user': '사용자가 팝업을 닫았습니다.',
  'auth/unauthorized-domain': '허용되지 않은 도메인입니다.',
  'auth/invalid-action-code': '잘못된 액션 코드입니다.',
  'auth/expired-action-code': '만료된 액션 코드입니다.',
  'auth/invalid-continue-uri': '잘못된 계속 URI입니다.',
  'auth/unauthorized-continue-uri': '허용되지 않은 계속 URI입니다.',
  'auth/missing-continue-uri': '계속 URI가 누락되었습니다.',
  'auth/missing-android-pkg-name': 'Android 패키지 이름이 누락되었습니다.',
  'auth/missing-ios-bundle-id': 'iOS 번들 ID가 누락되었습니다.',
  'auth/invalid-dynamic-link-domain': '잘못된 동적 링크 도메인입니다.',
  'auth/admin-restricted-operation': '관리자만 접근할 수 있는 작업입니다.',
  'auth/argument-error': '잘못된 인수입니다.',
  'auth/invalid-api-key': '잘못된 API 키입니다.',
  'auth/app-deleted': '앱이 삭제되었습니다.',
  'auth/app-not-authorized': '앱이 승인되지 않았습니다.',
  'auth/invalid-user-token': '잘못된 사용자 토큰입니다.',
  'auth/network-request-failed': '네트워크 요청이 실패했습니다. 인터넷 연결을 확인해주세요.',
  'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
  'auth/provider-already-linked': '이미 연결된 제공업체입니다.',
  'auth/no-auth-event': '인증 이벤트가 없습니다.',
  'auth/invalid-oauth-provider': '잘못된 OAuth 제공업체입니다.',
  'auth/invalid-oauth-client-id': '잘못된 OAuth 클라이언트 ID입니다.',
  'auth/oauth-account-not-linked': 'OAuth 계정이 연결되지 않았습니다.'
};

// Firestore 에러 코드 매핑
const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': '권한이 없습니다. 로그인 상태를 확인해주세요.',
  'not-found': '요청한 데이터를 찾을 수 없습니다.',
  'already-exists': '이미 존재하는 데이터입니다.',
  'invalid-argument': '잘못된 요청입니다.',
  'deadline-exceeded': '요청 시간이 초과되었습니다.',
  'resource-exhausted': '할당량을 초과했습니다.',
  'failed-precondition': '작업을 수행할 수 없는 상태입니다.',
  'aborted': '작업이 중단되었습니다.',
  'out-of-range': '유효하지 않은 범위입니다.',
  'unimplemented': '구현되지 않은 기능입니다.',
  'internal': '서버 내부 오류가 발생했습니다.',
  'unavailable': '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
  'data-loss': '데이터 손실이 발생했습니다.',
  'unauthenticated': '인증이 필요합니다. 로그인해주세요.',
  'cancelled': '작업이 취소되었습니다.',
  'unknown': '알 수 없는 오류가 발생했습니다.'
};

// 일반적인 에러 메시지
const GENERAL_ERROR_MESSAGES: Record<string, string> = {
  'network-error': '네트워크 연결을 확인해주세요.',
  'timeout': '요청 시간이 초과되었습니다.',
  'invalid-data': '잘못된 데이터 형식입니다.',
  'validation-error': '입력 데이터를 확인해주세요.',
  'server-error': '서버 오류가 발생했습니다.',
  'unknown': '알 수 없는 오류가 발생했습니다.'
};

export const handleAuthError = (error: AuthError | Error): AppError => {
  console.error('🚨 Auth 에러:', error);

  const errorCode = 'code' in error ? error.code : 'unknown';
  const userMessage = AUTH_ERROR_MESSAGES[errorCode] || '로그인 중 오류가 발생했습니다.';

  return {
    code: errorCode,
    message: error.message,
    userMessage,
    severity: 'error'
  };
};

export const handleFirestoreError = (error: FirestoreError | Error): AppError => {
  console.error('🚨 Firestore 에러:', error);

  const errorCode = 'code' in error ? error.code : 'unknown';
  const userMessage = FIRESTORE_ERROR_MESSAGES[errorCode] || '데이터 처리 중 오류가 발생했습니다.';

  return {
    code: errorCode,
    message: error.message,
    userMessage,
    severity: errorCode === 'permission-denied' ? 'warning' : 'error'
  };
};

export const handleGeneralError = (error: Error, type: 'network' | 'timeout' | 'validation' | 'server' | 'unknown' = 'unknown'): AppError => {
  console.error('🚨 일반 에러:', error);

  const userMessage = GENERAL_ERROR_MESSAGES[type] || '오류가 발생했습니다.';

  return {
    code: type,
    message: error.message,
    userMessage,
    severity: type === 'validation' ? 'warning' : 'error'
  };
};

// 사용자 친화적인 에러 메시지 생성
export const getErrorMessage = (error: any): string => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  // Firebase Auth 에러
  if (error.code && error.code.startsWith('auth/')) {
    return handleAuthError(error).userMessage;
  }

  // Firestore 에러
  if (error.code && FIRESTORE_ERROR_MESSAGES[error.code]) {
    return handleFirestoreError(error).userMessage;
  }

  // 네트워크 에러
  if (error.message && error.message.includes('network')) {
    return GENERAL_ERROR_MESSAGES['network-error'];
  }

  // 타임아웃 에러
  if (error.message && error.message.includes('timeout')) {
    return GENERAL_ERROR_MESSAGES['timeout'];
  }

  // 기본 메시지
  return error.message || GENERAL_ERROR_MESSAGES['unknown'];
};

// 에러 심각도 판단
export const getErrorSeverity = (error: any): 'error' | 'warning' | 'info' => {
  if (!error) return 'error';

  // 권한 관련 에러는 경고로 처리
  if (error.code === 'permission-denied' || error.code === 'auth/requires-recent-login') {
    return 'warning';
  }

  // 취소된 작업은 정보로 처리
  if (error.code === 'cancelled' || error.code === 'auth/popup-closed-by-user') {
    return 'info';
  }

  return 'error';
};

// 재시도 가능한 에러인지 판단
export const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  const retryableCodes = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'internal',
    'auth/network-request-failed',
    'auth/too-many-requests'
  ];

  return retryableCodes.includes(error.code);
};

// 에러 로깅
export const logError = (error: any, context: string, userId?: string): void => {
  const errorInfo = {
    context,
    userId,
    timestamp: new Date().toISOString(),
    code: error.code || 'unknown',
    message: error.message || 'No message',
    stack: error.stack || 'No stack trace',
    firebaseConfig: {
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'not-set'
    }
  };

  console.error(`🚨 [${context}] 에러 발생:`, errorInfo);

  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (import.meta.env.PROD) {
    // TODO: 외부 로깅 서비스 연동 (예: Sentry, LogRocket 등)
  }
};