# Firebase 보안 규칙 설정 가이드

## 1. Firestore 보안 규칙

Firebase Console > Firestore Database > 규칙에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 구독 정보는 소유자만 접근 가능
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // 사용자 설정은 본인만 접근 가능
    match /preferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 알림은 수신자만 접근 가능
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // 카테고리는 소유자만 접근 가능
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // 결제 기록은 소유자만 접근 가능
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // 통계 데이터는 소유자만 접근 가능
    match /statistics/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 테스트 컬렉션 (개발 중에만 사용)
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 2. Storage 보안 규칙

Firebase Console > Storage > 규칙에서 다음 규칙을 설정하세요:

```javascript


```

## 3. Authentication 설정

Firebase Console > Authentication > Sign-in method에서:

1. **이메일/비밀번호** 활성화
2. **Google** 활성화
   - OAuth 2.0 클라이언트 ID 설정
   - 승인된 도메인에 다음 추가:
     - localhost
     - sub.moonwave.kr
     - moonwave.kr

## 4. Firestore 인덱스

Firebase Console > Firestore Database > 인덱스에서 다음 복합 인덱스 추가:

### subscriptions 컬렉션
- 필드: `userId` (오름차순), `createdAt` (내림차순)
- 필드: `userId` (오름차순), `status` (오름차순), `paymentDay` (오름차순)
- 필드: `userId` (오름차순), `category` (오름차순)

### notifications 컬렉션
- 필드: `userId` (오름차순), `createdAt` (내림차순)
- 필드: `userId` (오름차순), `isRead` (오름차순), `createdAt` (내림차순)

### categories 컬렉션
- 필드: `userId` (오름차순), `name` (오름차순)

## 5. 보안 모범 사례

1. **최소 권한 원칙**: 사용자는 자신의 데이터만 접근
2. **입력 검증**: 클라이언트에서 보낸 데이터 검증
3. **크기 제한**: 파일 업로드 크기 제한
4. **타입 제한**: 허용된 파일 타입만 업로드
5. **인증 필수**: 모든 작업에 인증 요구

## 6. 환경별 설정

### 개발 환경
- 테스트 컬렉션 활성화
- 더 관대한 규칙 적용 가능

### 프로덕션 환경
- 엄격한 보안 규칙 적용
- 테스트 컬렉션 비활성화
- 모니터링 및 알림 설정

## 7. 모니터링

Firebase Console > Firestore Database > 사용량에서:
- 일일 읽기/쓰기 수 모니터링
- 비정상적인 활동 감지
- 할당량 초과 경고 설정