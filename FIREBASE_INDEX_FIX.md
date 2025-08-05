# Firebase Firestore 인덱스 오류 해결 가이드

## 🚨 발견된 오류
```
오류 코드: SUBSCRIPTION_ERROR
오류 메시지: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=...
발생 시간: 2025. 8. 5. 오후 1:30:56
```

## 🛠️ 해결 방법

### 1. 자동 해결 (권장)
Firebase Console에서 제공된 링크를 클릭하여 자동으로 인덱스 생성:
```
https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9zbXMtdjMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1YnNjcmlwdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

### 2. 수동 해결
Firebase Console → Firestore Database → 색인에서 다음 복합 인덱스 생성:

**컬렉션**: `subscriptions`
**필드들**:
- `userId` (오름차순)
- `createdAt` (내림차순)
- `__name__` (내림차순) - 자동 추가

### 3. 인덱스 상태 확인
인덱스 생성 후 5-10분 정도 소요될 수 있습니다.
상태가 "빌드됨"으로 변경되면 정상 작동합니다.

## 🔍 원인 분석
구독 데이터를 사용자별로 정렬하여 조회하는 쿼리에서 복합 인덱스가 필요합니다:
```javascript
// 이런 쿼리에서 인덱스가 필요
query(
  collection(db, 'subscriptions'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
)
```

## ✅ 해결 완료 후 확인사항
1. 구독 목록 페이지 정상 로드
2. 구독 추가/수정/삭제 정상 작동  
3. 통계 대시보드 정상 표시
4. 콘솔 오류 메시지 사라짐

이 인덱스는 앱의 핵심 기능인 구독 관리에 필요한 필수 인덱스입니다.