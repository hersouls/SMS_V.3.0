#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 SMS V.3.0 환경 변수 설정 도구');
console.log('=====================================\n');

// .env 파일 경로
const envPath = path.join(__dirname, '.env');

// 기본 환경 변수 템플릿
const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Application Configuration
VITE_APP_URL=https://sub.moonwave.kr
VITE_APP_NAME=SMS V.3.0
VITE_APP_VERSION=3.0.0

# Development Configuration
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true

# Allowed Origins for CORS
VITE_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://sub.moonwave.kr,https://www.sub.moonwave.kr
`;

// .env 파일이 이미 존재하는지 확인
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env 파일이 이미 존재합니다.');
  console.log('기존 파일을 백업하고 새로 생성하시겠습니까? (y/N)');
  
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    
    if (answer === 'y' || answer === 'yes') {
      // 백업 파일 생성
      const backupPath = path.join(__dirname, '.env.backup');
      fs.copyFileSync(envPath, backupPath);
      console.log('✅ 기존 .env 파일을 .env.backup으로 백업했습니다.');
      
      // 새 .env 파일 생성
      fs.writeFileSync(envPath, envTemplate);
      console.log('✅ 새로운 .env 파일을 생성했습니다.');
      console.log('\n🎉 환경 변수 설정이 완료되었습니다!');
      console.log('이제 다음 명령어로 개발 서버를 실행할 수 있습니다:');
      console.log('npm run dev');
    } else {
      console.log('❌ 작업이 취소되었습니다.');
    }
    process.exit(0);
  });
} else {
  // .env 파일 생성
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env 파일을 생성했습니다.');
  console.log('\n🎉 환경 변수 설정이 완료되었습니다!');
  console.log('이제 다음 명령어로 개발 서버를 실행할 수 있습니다:');
  console.log('npm run dev');
}

console.log('\n📋 설정된 환경 변수:');
console.log('- VITE_SUPABASE_URL: Supabase 프로젝트 URL');
console.log('- VITE_SUPABASE_ANON_KEY: Supabase 익명 키');
console.log('- VITE_GOOGLE_CLIENT_ID: Google OAuth 클라이언트 ID');
console.log('- VITE_APP_URL: 애플리케이션 URL');
console.log('- VITE_ALLOWED_ORIGINS: CORS 허용 도메인'); 