# Firebase 마이그레이션 가이드

## 개요
이 가이드는 Supabase에서 Firebase로 데이터베이스를 마이그레이션하는 방법을 설명합니다.

## 1. Firebase 프로젝트 설정

### 1.1 Firebase 콘솔에서 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "moonwave-sms")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 Firebase 서비스 활성화
1. **Authentication** 활성화
   - Authentication > Sign-in method
   - 이메일/비밀번호 제공업체 활성화
   - Google 로그인 활성화 (선택사항)

2. **Firestore Database** 활성화
   - Firestore Database > 데이터베이스 만들기
   - 테스트 모드로 시작 (개발 중)
   - 위치 선택 (예: asia-northeast3)

3. **Storage** 활성화 (선택사항)
   - Storage > 시작하기
   - 테스트 모드로 시작

### 1.3 웹 앱 등록
1. 프로젝트 개요 > 웹 앱 추가
2. 앱 닉네임 입력 (예: "moonwave-sms-web")
3. Firebase SDK 설정 복사

## 2. 환경 변수 설정

### 2.1 .env 파일 업데이트
기존 Supabase 환경 변수를 Firebase 환경 변수로 교체:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# 기존 Supabase 환경 변수는 주석 처리
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2.2 환경 변수 예시
```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=moonwave-sms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=moonwave-sms
VITE_FIREBASE_STORAGE_BUCKET=moonwave-sms.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 3. 패키지 설치

### 3.1 Firebase SDK 설치
```bash
npm install firebase
```

### 3.2 기존 Supabase 패키지 제거 (선택사항)
```bash
npm uninstall @supabase/supabase-js
```

## 4. 데이터 마이그레이션

### 4.1 Supabase에서 데이터 내보내기
1. Supabase 대시보드 > SQL Editor
2. 다음 쿼리 실행하여 데이터 내보내기:

```sql
-- 구독 데이터 내보내기
SELECT * FROM subscriptions;

-- 알림 데이터 내보내기
SELECT * FROM notifications;

-- 사용자 설정 데이터 내보내기
SELECT * FROM user_preferences;
```

### 4.2 Firebase로 데이터 가져오기
Firebase 콘솔에서 수동으로 데이터를 가져오거나, 마이그레이션 스크립트를 사용할 수 있습니다.

## 5. 보안 규칙 설정

### 5.1 Firestore 보안 규칙
Firestore Database > 규칙에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 구독 컬렉션
    match /subscriptions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // 알림 컬렉션
    match /notifications/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // 사용자 설정 컬렉션
    match /userPreferences/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5.2 Storage 보안 규칙 (선택사항)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. 코드 변경사항

### 6.1 기존 Supabase import 제거
```typescript
// 기존
import { supabase } from '@/utils/supabase/client';

// 새로운 Firebase import
import { auth, db } from '@/utils/firebase/config';
import { authService } from '@/utils/firebase/auth';
import { subscriptionService } from '@/utils/firebase/database';
```

### 6.2 인증 코드 변경
```typescript
// 기존 Supabase 인증
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// 새로운 Firebase 인증
const userCredential = await authService.signInWithEmail(email, password);
```

### 6.3 데이터베이스 쿼리 변경
```typescript
// 기존 Supabase 쿼리
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId);

// 새로운 Firebase 쿼리
const subscriptions = await subscriptionService.getSubscriptions(userId);
```

## 7. 테스트 및 검증

### 7.1 연결 테스트
```typescript
import { checkFirebaseConnection } from '@/utils/firebase/config';

const isConnected = await checkFirebaseConnection();
console.log('Firebase 연결 상태:', isConnected);
```

### 7.2 인증 테스트
```typescript
import { authService } from '@/utils/firebase/auth';

// 로그인 테스트
try {
  const userCredential = await authService.signInWithEmail('test@example.com', 'password');
  console.log('로그인 성공:', userCredential.user.email);
} catch (error) {
  console.error('로그인 실패:', error);
}
```

## 8. 배포 고려사항

### 8.1 환경 변수 설정
- 개발 환경: `.env.local`
- 프로덕션 환경: 배포 플랫폼의 환경 변수 설정

### 8.2 도메인 설정
Firebase Authentication > 설정 > 승인된 도메인에서 프로덕션 도메인 추가

### 8.3 SSL 인증서
Firebase는 자동으로 SSL 인증서를 제공하므로 별도 설정 불필요

## 9. 성능 최적화

### 9.1 인덱스 설정
Firestore에서 자주 사용되는 쿼리에 대한 복합 인덱스 생성

### 9.2 캐싱 전략
Firebase SDK의 자동 캐싱 기능 활용

## 10. 모니터링 및 로그

### 10.1 Firebase Analytics
사용자 행동 분석을 위한 Analytics 설정

### 10.2 Firebase Crashlytics
앱 크래시 모니터링 설정

## 11. 롤백 계획

### 11.1 Supabase 백업 유지
마이그레이션 완료 전까지 Supabase 데이터 백업 유지

### 11.2 점진적 마이그레이션
기능별로 점진적으로 마이그레이션하여 위험 최소화

## 12. 비용 비교

### 12.1 Supabase vs Firebase 비용
- Supabase: 무료 티어 후 유료
- Firebase: 더 관대한 무료 티어, 사용량 기반 과금

### 12.2 예상 비용 계산
Firebase 콘솔에서 사용량 모니터링 및 비용 예측 도구 활용

## 13. 마이그레이션 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Authentication 활성화
- [ ] Firestore Database 활성화
- [ ] 환경 변수 설정
- [ ] Firebase SDK 설치
- [ ] 보안 규칙 설정
- [ ] 코드 마이그레이션
- [ ] 데이터 마이그레이션
- [ ] 테스트 및 검증
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] Supabase 정리 (선택사항)

## 14. 문제 해결

### 14.1 일반적인 오류
- 환경 변수 미설정
- 보안 규칙 오류
- 인증 도메인 미설정

### 14.2 디버깅 팁
- Firebase 콘솔의 로그 확인
- 브라우저 개발자 도구 네트워크 탭 확인
- Firebase Emulator 사용 (로컬 개발)

## 15. 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase 인증](https://firebase.google.com/docs/auth) 