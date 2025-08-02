# SMS V.2.0 - Subscription Management System

구독 관리 시스템 (SMS V.2.0)은 개인 및 팀의 구독 서비스를 효율적으로 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **구독 관리**: 다양한 구독 서비스의 등록, 수정, 삭제
- **결제 알림**: 결제일 알림 및 관리
- **비용 추적**: 월별/연간 구독 비용 분석
- **환율 설정**: 다국가 구독 비용 관리
- **반응형 디자인**: 모바일/데스크톱 최적화
- **Google OAuth**: Google 계정으로 간편 로그인

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Styling**: Tailwind CSS, Shadcn/ui
- **Deployment**: Vercel, Netlify
- **Authentication**: Supabase Auth, Google OAuth

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd SMS_V.2.0
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://bfurhjgnnjgfcafdrotk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdXJoamdubmpnZmNhZmRyb3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQ4NTIsImV4cCI6MjA2OTE4MDg1Mn0.mxP7V92XRdY8e_7r9GR3B04blukhVf1vu_teRguv20U

# Google OAuth
VITE_GOOGLE_CLIENT_ID=350164367455-h4c615pr0eqoaj218bi6stlvpiqab45k.apps.googleusercontent.com

# Application Configuration
VITE_APP_URL=https://sub.moonwave.kr
VITE_APP_NAME=SMS V.2.0
VITE_APP_VERSION=2.0.0

# Development Configuration
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true

# Allowed Origins for CORS
VITE_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://sub.moonwave.kr,https://www.sub.moonwave.kr
```

### 4. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 🌐 배포 도메인 설정

### Localhost 개발
- `http://localhost:3000`
- `http://localhost:5173`

### 프로덕션 도메인
- `https://sub.moonwave.kr` (메인 도메인)
- `https://www.sub.moonwave.kr` (www 서브도메인)

## 🔧 Supabase 설정

### 1. Supabase 프로젝트 설정
- 프로젝트 ID: `bfurhjgnnjgfcafdrotk`
- URL: `https://bfurhjgnnjgfcafdrotk.supabase.co`

### 2. CORS 설정
Supabase Edge Functions에서 다음 도메인들이 허용됩니다:
- `http://localhost:5173`
- `http://localhost:3000`
- `http://localhost:4173`
- `http://localhost:8080`
- `https://sub.moonwave.kr`
- `https://www.sub.moonwave.kr`

### 3. 환경별 설정
- **개발 환경**: 모든 origin 허용
- **프로덕션 환경**: 허용된 도메인만 접근 가능

## 🔐 Google OAuth 설정

### 중요: Google OAuth 설정이 필요합니다!

Google 로그인 기능을 사용하려면 다음 설정이 필요합니다:

1. **Google Cloud Console 설정**
   - [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 ID 생성
   - 승인된 리다이렉트 URI 설정

2. **Supabase 설정**
   - Authentication > Providers에서 Google 제공업체 활성화
   - Site URL과 Redirect URLs 설정

자세한 설정 방법은 [Google OAuth 설정 가이드](docs/Google-OAuth-Setup.md)를 참조하세요.

### 현재 Google OAuth 오류 해결

`redirect_uri_mismatch` 오류가 발생하는 경우:

1. **Google Cloud Console**에서 다음 URI들을 승인된 리다이렉트 URI에 추가:
   ```
   http://localhost:3000/dashboard
   http://localhost:5173/dashboard
   https://sub.moonwave.kr/dashboard
   https://bfurhjgnnjgfcafdrotk.supabase.co/auth/v1/callback
   ```

2. **Supabase Dashboard**에서 Site URL과 Redirect URLs 설정

3. 브라우저 캐시 및 쿠키 삭제 후 재시도

## 📁 프로젝트 구조

```
SMS_V.2.0/
├── components/          # React 컴포넌트
│   ├── ui/             # Shadcn/ui 컴포넌트
│   └── ...
├── utils/              # 유틸리티 함수
│   ├── supabase/       # Supabase 설정
│   └── api.ts          # API 서비스
├── supabase/           # Supabase 설정
│   └── functions/      # Edge Functions
├── styles/             # 스타일 파일
└── docs/              # 문서
```

## 🔐 인증

- **Supabase Auth**: 이메일/비밀번호, Google OAuth 지원
- **세션 관리**: 자동 토큰 갱신 및 세션 유지
- **권한 관리**: 사용자별 데이터 접근 제어

## 🚀 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### Netlify 배포
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📝 개발 가이드

자세한 개발 가이드는 `docs/` 폴더를 참조하세요:
- `docs/개발체크리스트.md`
- `docs/데이터베이스스키마.md`
- `docs/디자인가이드.md`
- `docs/Google-OAuth-Setup.md`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요. 