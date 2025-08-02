# Google OAuth 설정 가이드

## 🔧 Google Cloud Console 설정

### 1. Google Cloud Console 접속
- [Google Cloud Console](https://console.cloud.google.com/)에 접속
- 프로젝트 선택 또는 새 프로젝트 생성

### 2. OAuth 2.0 클라이언트 ID 생성
1. **API 및 서비스** > **사용자 인증 정보**로 이동
2. **사용자 인증 정보 만들기** > **OAuth 2.0 클라이언트 ID** 클릭
3. 애플리케이션 유형: **웹 애플리케이션** 선택

### 3. 승인된 JavaScript 원본 설정 ⚠️ 중요

**JavaScript 원본에는 도메인만 허용됩니다. 경로는 절대 포함하지 마세요!**

다음 도메인들을 **승인된 JavaScript 원본**에 추가하세요:

```
# 개발 환경 (도메인만)
http://localhost:3000
http://localhost:5173
http://localhost:4173
http://localhost:8080

# 프로덕션 환경 (도메인만)
https://sub.moonwave.kr
https://www.sub.moonwave.kr
https://moonwave.kr
https://www.moonwave.kr
```

### 4. 승인된 리다이렉트 URI 설정 ⚠️ 중요

**리다이렉트 URI에는 반드시 경로가 포함되어야 합니다!**

다음 URI들을 **승인된 리다이렉트 URI**에 추가하세요:

```
# 개발 환경 (도메인 + 경로)
http://localhost:3000/dashboard
http://localhost:5173/dashboard
http://localhost:4173/dashboard
http://localhost:8080/dashboard

# 프로덕션 환경 (도메인 + 경로)
https://sub.moonwave.kr/dashboard
https://www.sub.moonwave.kr/dashboard
https://moonwave.kr/dashboard
https://www.moonwave.kr/dashboard

# Supabase Auth 리다이렉트 (필수)
https://bfurhjgnnjgfcafdrotk.supabase.co/auth/v1/callback
```

## 🔧 Supabase 설정

### 1. Supabase 프로젝트 설정
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택: `bfurhjgnnjgfcafdrotk`

### 2. Authentication 설정
1. **Authentication** > **Providers**로 이동
2. **Google** 제공업체 활성화
3. **Client ID**와 **Client Secret** 입력
   - Client ID: `350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com`
   - Client Secret: Google Cloud Console에서 생성한 클라이언트 시크릿

### 3. Site URL 설정
**Authentication** > **Settings**에서 다음 URL들을 추가:

```
# 개발 환경 (도메인만)
http://localhost:3000
http://localhost:5173
http://localhost:4173
http://localhost:8080

# 프로덕션 환경 (도메인만)
https://sub.moonwave.kr
https://www.sub.moonwave.kr
https://moonwave.kr
https://www.moonwave.kr
```

### 4. Redirect URLs 설정
**Authentication** > **URL Configuration**에서 다음 리다이렉트 URL들을 추가:

```
# 개발 환경 (도메인 + 경로)
http://localhost:3000/dashboard
http://localhost:5173/dashboard
http://localhost:4173/dashboard
http://localhost:8080/dashboard

# 프로덕션 환경 (도메인 + 경로)
https://sub.moonwave.kr/dashboard
https://www.sub.moonwave.kr/dashboard
https://moonwave.kr/dashboard
https://www.moonwave.kr/dashboard
```

## 🚨 오류 해결

### redirect_uri_mismatch 오류
이 오류가 발생하는 경우:

1. **Google Cloud Console**에서 승인된 리다이렉트 URI 확인
2. **Supabase**에서 Site URL과 Redirect URLs 확인
3. 애플리케이션에서 사용하는 도메인이 모두 등록되어 있는지 확인

### 일반적인 해결 방법
1. 모든 개발 및 프로덕션 도메인을 Google Cloud Console에 등록
2. Supabase 설정에서 Site URL과 Redirect URLs 업데이트
3. 브라우저 캐시 및 쿠키 삭제
4. 애플리케이션 재시작

## 📝 환경 변수 확인

`.env` 파일에서 다음 설정을 확인하세요:

```env
VITE_GOOGLE_CLIENT_ID=350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com
VITE_SUPABASE_URL=https://bfurhjgnnjgfcafdrotk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdXJoamdubmpnZmNhZmRyb3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQ4NTIsImV4cCI6MjA2OTE4MDg1Mn0.mxP7V92XRdY8e_7r9GR3B04blukhVf1vu_teRguv20U
```

## 🔍 테스트 방법

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. 로그인 페이지에서 "Google로 로그인" 버튼 클릭
4. Google 계정으로 로그인 시도
5. 성공적으로 대시보드로 리다이렉트되는지 확인

## 📞 문제 해결

여전히 문제가 발생하는 경우:

1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. Google Cloud Console의 OAuth 동의 화면 설정 확인
3. Supabase 로그에서 오류 메시지 확인
4. 모든 도메인이 올바르게 등록되었는지 재확인 