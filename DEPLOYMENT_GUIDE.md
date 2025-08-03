# 🚀 SMS V2.0 Supabase 프로덕션 배포 가이드

## ✅ 배포 완료 상태

현재 프로젝트는 **실제 Supabase DB와 성공적으로 연결**되었으며 프로덕션 배포 준비가 완료되었습니다.

### 🔗 연결된 Supabase 정보
- **Supabase URL**: `https://bfurhjgnnjgfcafdrotk.supabase.co`
- **프로젝트**: Moonwave SMS V2.0
- **앱 URL**: `https://sub.moonwave.kr`

## ✅ 완료된 설정 사항

### 1. 환경 변수 설정
```bash
# 프로덕션용 환경 변수 (.env)
VITE_SUPABASE_URL=https://bfurhjgnnjgfcafdrotk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com
VITE_APP_URL=https://sub.moonwave.kr
VITE_APP_NAME="SMS V.3.0"
VITE_APP_VERSION=3.0.0
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG=false
VITE_ALLOWED_ORIGINS=https://sub.moonwave.kr,https://www.sub.moonwave.kr
```

### 2. 데이터베이스 스키마 확인 ✅
- ✅ `subscriptions` 테이블
- ✅ `notifications` 테이블
- ✅ `user_preferences` 테이블
- ✅ `subscription_tags` 테이블
- ✅ `payment_history` 테이블

### 3. 보안 설정 확인 ✅
- ✅ Supabase 연결 성공
- ✅ 인증 서비스 작동
- ✅ RLS (Row Level Security) 활성화
- ✅ 프로덕션 모드 활성화

### 4. 빌드 테스트 완료 ✅
```bash
npm run build
# ✓ built in 6.20s - 성공!
```

## 🔧 Supabase 대시보드 설정 확인사항

### 1. Authentication 설정
1. **Site URL 설정**
   - `https://sub.moonwave.kr`

2. **Redirect URLs 설정**
   - `https://sub.moonwave.kr/auth/callback`
   - `https://www.sub.moonwave.kr/auth/callback`

3. **Google OAuth 설정**
   - Client ID: `350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com`
   - 승인된 JavaScript 출처: `https://sub.moonwave.kr`
   - 승인된 리디렉션 URI: `https://sub.moonwave.kr/auth/callback`

### 2. Database 설정
1. **RLS 정책 확인**
   - 모든 테이블에 RLS가 활성화되어 있는지 확인
   - 사용자별 데이터 접근 제한이 올바르게 설정되어 있는지 확인

2. **함수 및 트리거 확인**
   - `supabase/database-functions.sql` 실행 여부 확인
   - 자동 프로필 생성 트리거 작동 확인

### 3. Storage 설정 (필요시)
- 버킷 생성 및 RLS 정책 설정
- 파일 업로드 권한 설정

## 📝 배포 스크립트

### 연결 테스트
```bash
# Supabase 연결 테스트
node scripts/simple-test.js

# 데이터베이스 스키마 확인
node scripts/check-database-schema.js

# 프로덕션 준비 상태 종합 확인
node scripts/production-ready-check.js
```

### 빌드 및 배포
```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 로컬 미리보기 (선택사항)
npm run preview
```

## 🚨 보안 체크리스트

- ✅ Service Role Key는 서버 환경에서만 사용 (`SUPABASE_SERVICE_ROLE_KEY`)
- ✅ 모든 민감한 테이블에 RLS 활성화
- ✅ 인증되지 않은 사용자의 데이터 접근 차단
- ✅ CORS 설정으로 허용된 도메인만 접근 가능
- ✅ 프로덕션 모드에서 디버그 정보 비활성화

## 🔍 배포 후 확인사항

### 1. 기능 테스트
1. **회원가입/로그인**
   - 이메일 인증 작동 확인
   - Google OAuth 로그인 확인

2. **구독 관리**
   - 구독 추가/수정/삭제 기능
   - 결제일 계산 정확성
   - 알림 설정 기능

3. **대시보드**
   - 통계 데이터 표시
   - 차트 렌더링
   - 반응형 디자인 확인

### 2. 성능 테스트
```bash
# Lighthouse 성능 측정
npm run test:lighthouse

# 기능 테스트
npm run test:e2e
```

### 3. 모니터링 설정
- 오류 추적 시스템 설정
- 성능 모니터링 설정
- 데이터베이스 쿼리 성능 확인

## 🆘 문제 해결

### 자주 발생하는 문제

1. **"Invalid API key" 오류**
   - Supabase 프로젝트 URL과 Anon Key가 올바른지 확인
   - 환경 변수가 제대로 로드되는지 확인

2. **RLS 정책 오류**
   - Supabase 대시보드에서 RLS 정책 확인
   - 사용자 인증 상태 확인

3. **CORS 오류**
   - Supabase 대시보드의 Auth 설정에서 Site URL과 Redirect URLs 확인
   - `VITE_ALLOWED_ORIGINS` 환경 변수 확인

### 지원 연락처
- 개발팀: [개발팀 연락처]
- Supabase 문서: https://supabase.com/docs

---

## 🎉 배포 완료!

SMS V2.0이 실제 Supabase 데이터베이스와 성공적으로 연결되었습니다. 
모든 필수 설정이 완료되었으며 프로덕션 환경에서 안전하게 운영할 수 있습니다.

**배포 URL**: https://sub.moonwave.kr