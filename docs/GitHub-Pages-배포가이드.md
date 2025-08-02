# GitHub Pages 배포 가이드

SMS V.2.0을 GitHub Pages에 배포하기 위한 단계별 가이드입니다.

## 🚀 자동 배포 설정 (권장)

### 1. GitHub Secrets 설정

GitHub 리포지토리 Settings → Secrets and variables → Actions에서 다음 환경 변수를 추가하세요:

```
VITE_SUPABASE_URL=https://bfurhjgnnjgfcafdrotk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdXJoamdubmpnZmNhZmRyb3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQ4NTIsImV4cCI6MjA2OTE4MDg1Mn0.mxP7V92XRdY8e_7r9GR3B04blukhVf1vu_teRguv20U
VITE_GOOGLE_CLIENT_ID=350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com
```

### 2. GitHub Pages 활성화

1. GitHub 리포지토리에서 **Settings** → **Pages**로 이동
2. Source에서 **GitHub Actions** 선택
3. 저장

### 3. 자동 배포 실행

- `main` 또는 `master` 브랜치에 코드를 푸시하면 자동으로 배포됩니다
- GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다

## 🔧 수동 배포 (선택사항)

수동으로 배포하려면 다음 명령어를 실행하세요:

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# gh-pages 브랜치에 배포 (gh-pages 패키지 필요)
npm install -g gh-pages
gh-pages -d dist
```

## 📍 배포 URL

배포 완료 후 다음 URL에서 애플리케이션에 접근할 수 있습니다:

- **Production URL**: `https://hersouls.github.io/SMS_V.3.0/`

## 🔐 환경 설정

### Supabase 설정 업데이트

1. Supabase Dashboard → Authentication → URL Configuration에서 다음 URL들을 추가:
   ```
   Site URL: https://hersouls.github.io/SMS_V.3.0/
   Redirect URLs:
   - https://hersouls.github.io/SMS_V.3.0/
   - https://hersouls.github.io/SMS_V.3.0/dashboard
   ```

### Google OAuth 설정 업데이트

1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client IDs에서 승인된 리다이렉트 URI에 추가:
   ```
   https://hersouls.github.io/SMS_V.3.0/dashboard
   https://bfurhjgnnjgfcafdrotk.supabase.co/auth/v1/callback
   ```

## 🛠️ 기술적 변경 사항

### 1. Router 변경
- `BrowserRouter`에서 `HashRouter`로 변경하여 GitHub Pages에서 라우팅 지원

### 2. Base Path 설정
```typescript
// vite.config.ts
base: process.env.NODE_ENV === 'production' ? '/SMS_V.3.0/' : '/',
```

### 3. SPA 라우팅 지원
- `public/404.html` 파일 추가
- `index.html`에 라우팅 처리 스크립트 추가

## 🚨 문제 해결

### 404 오류 발생 시
1. GitHub Pages 설정에서 Source가 **GitHub Actions**로 되어 있는지 확인
2. 빌드 로그에서 오류가 없는지 확인
3. 브라우저 캐시 삭제 후 다시 시도

### 환경 변수 오류 시
1. GitHub Secrets에 모든 필요한 환경 변수가 설정되어 있는지 확인
2. 환경 변수 이름이 정확한지 확인 (대소문자 구분)

### OAuth 오류 시
1. Supabase와 Google Cloud Console에서 새로운 URL이 올바르게 설정되었는지 확인
2. 브라우저에서 쿠키와 localStorage 삭제 후 다시 로그인 시도

## 📝 추가 참고사항

- GitHub Pages는 HTTPS만 지원합니다
- 배포는 일반적으로 1-2분 소요됩니다
- 환경 변수 변경 시 GitHub Actions에서 수동으로 다시 실행할 수 있습니다

## 🔄 업데이트 방법

코드 변경 후 배포하려면:

1. 변경사항을 `main` 브랜치에 커밋 및 푸시
2. GitHub Actions가 자동으로 실행됩니다
3. 배포 완료 후 브라우저에서 확인

---

배포 과정에서 문제가 발생하면 GitHub Issues에 문의해 주세요.