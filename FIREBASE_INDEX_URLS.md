# Firebase 인덱스 생성 URL

Firebase Firestore 인덱스 에러를 빠르게 해결하기 위한 직접 링크입니다.

## 🚨 즉시 해결이 필요한 인덱스

### 1. Subscriptions 컬렉션 인덱스
- **userId + createdAt (DESC)**
  - [인덱스 생성 링크](https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=Cltwcm9qZWN0cy9zbXMtdjMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1YnNjcmlwdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

### 2. Notifications 컬렉션 인덱스
- **userId + createdAt (DESC)**
  - [인덱스 생성 링크](https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9zbXMtdjMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGlmaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

### 3. Categories 컬렉션 인덱스
- **userId + name (ASC)**
  - [인덱스 생성 링크](https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=Ckdwcm9qZWN0cy9zbXMtdjMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NhdGVnb3JpZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaCAoEbmFtZRABGgwKCF9fbmFtZV9fEAE)

### 4. StatisticsReports 컬렉션 인덱스
- **userId + createdAt (DESC)**
  - 자동 생성됨 (Firebase CLI로 배포 완료)
- **userId + reportType + createdAt (DESC)**
  - 자동 생성됨 (Firebase CLI로 배포 완료)

**⚡ 위 링크를 클릭하면 바로 인덱스가 생성됩니다!**

## 수동 생성 방법

1. [Firebase Console - Firestore 인덱스](https://console.firebase.google.com/project/sms-v3/firestore/indexes) 접속
2. "인덱스 만들기" 클릭
3. 다음 설정으로 생성:

### Subscriptions 인덱스
- 컬렉션 ID: `subscriptions`
- 필드:
  - userId (오름차순)
  - createdAt (내림차순)
- 쿼리 범위: 컬렉션

### Notifications 인덱스
- 컬렉션 ID: `notifications`
- 필드:
  - userId (오름차순)
  - createdAt (내림차순)
- 쿼리 범위: 컬렉션

## 참고사항
- 인덱스 생성 후 2-5분 정도 기다려야 적용됩니다
- `firebase deploy --only firestore:indexes` 명령으로도 배포 가능합니다
- firestore.indexes.json 파일이 이미 구성되어 있습니다