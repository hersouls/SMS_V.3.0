# Firebase 연결 오류 해결 가이드

## 🔥 문제 상황
```
WebChannelConnection RPC 'Listen' stream transport errored: jd {type: 'c', target: Y2, g: Y2, defaultPrevented: false, status: 1}
```

이 오류는 Firebase Firestore 연결에서 발생하는 일반적인 문제입니다.

## 🛠️ 해결 방법

### 1. 환경 변수 설정 확인

Firebase 환경 변수가 설정되지 않아서 발생하는 문제입니다.

#### 1.1 .env 파일 생성
```bash
# 프로젝트 루트에 .env 파일 생성
cp env.example .env
```

#### 1.2 Firebase 환경 변수 설정
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Firebase 프로젝트 설정

#### 2.1 Firebase Console에서 설정 확인
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 프로젝트 설정 > 일반 탭
4. 웹 앱 설정에서 환경 변수 값 확인

#### 2.2 Firestore 규칙 설정
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. 코드 수정 사항

#### 3.1 Firebase 설정 개선
- `utils/firebase/config.ts`에서 환경 변수 없이도 초기화 가능하도록 수정
- 에러 핸들링 강화
- 재연결 로직 추가

#### 3.2 useFirestore 훅 개선
- `hooks/useFirestore.ts`에서 Firebase 사용 불가능 시 Supabase로 대체
- 연결 오류 시 자동 재시도 로직 추가
- 더 강력한 에러 핸들링

#### 3.3 Firebase 디버거 추가
- `components/FirebaseDebugger.tsx`로 연결 상태 모니터링
- 실시간 상태 확인 가능

### 4. 개발 모드에서 디버깅

#### 4.1 Firebase 디버거 사용
1. 개발 모드에서 우하단 🔥 버튼 클릭
2. Firebase 연결 상태 확인
3. 환경 변수 설정 확인
4. 실시간 상태 모니터링

#### 4.2 콘솔 로그 확인
```javascript
// 브라우저 콘솔에서 확인
console.log('Firebase 환경 변수:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '설정됨' : '설정되지 않음',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '설정됨' : '설정되지 않음',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '설정됨' : '설정되지 않음'
});
```

### 5. 대안: Supabase 사용

Firebase 설정이 어려운 경우 Supabase를 사용할 수 있습니다:

#### 5.1 Supabase 환경 변수 설정
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 5.2 Supabase 테스트 도구 사용
- `/supabase-test` 경로에서 Supabase 연결 테스트
- 모든 기능이 정상 작동하는지 확인

### 6. 네트워크 문제 해결

#### 6.1 방화벽 설정
- Firebase 포트(443, 8080) 허용
- 회사/학교 네트워크에서 Firebase 접근 가능한지 확인

#### 6.2 프록시 설정
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/firebase': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

### 7. 프로덕션 배포 시 주의사항

#### 7.1 환경 변수 설정
- 배포 플랫폼에서 환경 변수 설정
- GitHub Actions, Vercel, Netlify 등

#### 7.2 도메인 허용 설정
- Firebase Console에서 허용된 도메인 추가
- CORS 설정 확인

### 8. 문제 해결 체크리스트

- [ ] .env 파일이 존재하는가?
- [ ] Firebase 환경 변수가 올바르게 설정되었는가?
- [ ] Firebase 프로젝트가 활성화되어 있는가?
- [ ] Firestore 규칙이 올바르게 설정되었는가?
- [ ] 네트워크 연결이 정상적인가?
- [ ] 브라우저 콘솔에서 오류가 없는가?
- [ ] Firebase 디버거에서 연결 상태가 정상인가?

### 9. 추가 도움말

#### 9.1 Firebase 문서
- [Firebase 설정 가이드](https://firebase.google.com/docs/web/setup)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

#### 9.2 문제 보고
- Firebase 연결 문제가 지속되면 이슈 생성
- 콘솔 로그와 함께 상세한 오류 정보 제공

---

## 📝 요약

Firebase 연결 오류는 주로 환경 변수 설정 문제로 발생합니다. 위의 단계를 따라 설정하면 문제를 해결할 수 있습니다. 개발 모드에서는 Firebase 디버거를 사용하여 실시간으로 연결 상태를 모니터링할 수 있습니다. 