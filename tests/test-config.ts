// 테스트 환경 설정
export const TEST_CONFIG = {
  // 실제 계정 (기존 계정) - 테스트용으로 사용
  TEST_USER: {
    email: 'her_soul@naver.com',
    password: '27879876',
    name: '실제 사용자'
  },
  
  // 통합 테스트용 계정 (실제 계정 사용)
  INTEGRATION_USER: {
    email: 'her_soul@naver.com',
    password: '27879876',
    name: '실제 사용자'
  },
  
  // API 테스트용 계정 (실제 계정 사용)
  API_USER: {
    email: 'her_soul@naver.com',
    password: '27879876',
    name: '실제 사용자'
  },
  
  // 실제 계정 (기존 계정)
  REAL_USER: {
    email: 'her_soul@naver.com',
    password: '27879876',
    name: '실제 사용자'
  }
};

// 테스트 환경 설정
export const TEST_ENV = {
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:5173',
  TIMEOUT: 30000,
  RETRY_COUNT: 3
};

// 테스트 데이터
export const TEST_SUBSCRIPTION = {
  serviceName: 'Netflix',
  amount: 17000,
  currency: 'KRW',
  paymentCycle: 'monthly',
  paymentDay: 15,
  category: '엔터테인먼트',
  tags: ['스트리밍', '영화']
}; 