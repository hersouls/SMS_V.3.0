/** @type {import('jest').Config} */
export default {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',
  
  // 모듈 파일 확장자
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  
  // 테스트 파일 패턴
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // 변환 설정
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 무시할 패턴
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // 테스트 타임아웃
  testTimeout: 10000,
  
  // 변환 무시 패턴
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)'
  ]
};