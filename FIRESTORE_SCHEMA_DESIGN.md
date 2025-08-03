# 📊 Firestore Database Schema Design

## 🎯 설계 원칙

1. **NoSQL 최적화**: Firestore의 문서 기반 구조에 맞춰 설계
2. **쿼리 효율성**: 자주 사용되는 쿼리에 최적화된 구조
3. **확장성**: 향후 기능 추가를 고려한 유연한 구조
4. **비용 효율성**: 읽기/쓰기 작업 최소화

## 📁 컬렉션 구조

### 1. Users Collection (`/users/{userId}`)

사용자 기본 정보 및 관련 서브컬렉션을 포함하는 최상위 컬렉션

```typescript
interface User {
  // 기본 정보
  id: string;                    // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  
  // 계정 정보
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  
  // 통계 요약 (캐시)
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalMonthlyPayment: number;
    lastUpdated: Timestamp;
  };
  
  // 설정
  settings: {
    currency: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      paymentReminders: boolean;
    };
  };
}
```

#### 1.1 Subscriptions Subcollection (`/users/{userId}/subscriptions/{subscriptionId}`)

```typescript
interface Subscription {
  // 기본 정보
  id: string;
  serviceName: string;
  serviceUrl?: string;
  logoUrl?: string;
  
  // 결제 정보
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  customBillingDays?: number;
  
  // 날짜 정보
  startDate: Timestamp;
  nextPaymentDate: Timestamp;
  lastPaymentDate?: Timestamp;
  endDate?: Timestamp;
  
  // 상태
  isActive: boolean;
  isPaused: boolean;
  
  // 카테고리 및 태그
  categoryId: string;
  categoryName: string;        // 중복 저장 for 쿼리 최적화
  tagIds: string[];
  
  // 알림 설정
  notificationDays: number;    // 결제일 X일 전 알림
  notificationEnabled: boolean;
  
  // 메타데이터
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
  
  // 통계 (캐시)
  totalPaid: number;
  paymentCount: number;
}
```

#### 1.2 Notifications Subcollection (`/users/{userId}/notifications/{notificationId}`)

```typescript
interface Notification {
  id: string;
  type: 'payment_reminder' | 'payment_completed' | 'subscription_expiring' | 'system';
  
  // 내용
  title: string;
  message: string;
  actionUrl?: string;
  
  // 관련 데이터
  subscriptionId?: string;
  subscriptionName?: string;
  amount?: number;
  
  // 상태
  isRead: boolean;
  readAt?: Timestamp;
  
  // 메타데이터
  createdAt: Timestamp;
  expiresAt?: Timestamp;       // 자동 삭제용
}
```

#### 1.3 Preferences Subcollection (`/users/{userId}/preferences/{preferenceId}`)

```typescript
interface UserPreference {
  id: string;
  type: 'display' | 'notification' | 'privacy' | 'advanced';
  
  preferences: {
    [key: string]: any;
  };
  
  updatedAt: Timestamp;
}
```

#### 1.4 Analytics Subcollection (`/users/{userId}/analytics/{analyticsId}`)

```typescript
interface UserAnalytics {
  id: string;                   // YYYY-MM 형식
  year: number;
  month: number;
  
  // 월별 통계
  totalAmount: number;
  subscriptionCount: number;
  
  // 카테고리별 통계
  byCategory: {
    [categoryId: string]: {
      name: string;
      amount: number;
      count: number;
    };
  };
  
  // 일별 상세 (선택적)
  dailyBreakdown?: {
    [day: number]: {
      amount: number;
      payments: string[];       // subscription IDs
    };
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. Categories Collection (`/categories/{categoryId}`)

시스템 전체 카테고리 (모든 사용자 공통)

```typescript
interface Category {
  id: string;
  name: string;
  nameKo: string;               // 한국어 이름
  
  // UI 정보
  icon: string;
  color: string;
  order: number;
  
  // 시스템 정보
  isDefault: boolean;           // 시스템 기본 카테고리
  isActive: boolean;
  
  // 통계 (캐시)
  usageCount: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Tags Collection (`/tags/{tagId}`)

사용자별 태그 (전체 공유 가능)

```typescript
interface Tag {
  id: string;
  name: string;
  
  // 소유자 정보
  userId: string;               // 생성한 사용자
  isPublic: boolean;            // 다른 사용자와 공유
  
  // UI 정보
  color?: string;
  
  // 통계
  usageCount: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. Payment History Collection (`/paymentHistory/{userId}/payments/{paymentId}`)

결제 내역 (감사 추적용)

```typescript
interface PaymentRecord {
  id: string;
  
  // 구독 정보
  subscriptionId: string;
  subscriptionName: string;
  
  // 결제 정보
  amount: number;
  currency: string;
  paymentDate: Timestamp;
  
  // 상태
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // 메타데이터
  createdAt: Timestamp;
  notes?: string;
}
```

### 5. Statistics Collection (`/statistics/{statId}`)

전체 시스템 통계 (관리자용)

```typescript
interface SystemStatistics {
  id: string;                   // YYYY-MM-DD 형식
  date: Timestamp;
  
  // 사용자 통계
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  
  // 구독 통계
  totalSubscriptions: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  
  // 결제 통계
  totalRevenue: number;
  averageSubscriptionValue: number;
  
  // 인기 서비스
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  
  createdAt: Timestamp;
}
```

## 🔄 데이터 마이그레이션 매핑

### Supabase → Firestore 테이블 매핑

| Supabase Table | Firestore Collection | Notes |
|----------------|---------------------|-------|
| users (auth) | /users | Firebase Auth 통합 |
| subscriptions | /users/{userId}/subscriptions | 서브컬렉션으로 이동 |
| notifications | /users/{userId}/notifications | 서브컬렉션으로 이동 |
| payment_history | /paymentHistory/{userId}/payments | 별도 컬렉션 |
| subscription_categories | /categories | 전역 컬렉션 |
| subscription_tags | /tags | 전역 컬렉션 |
| subscription_tag_relations | (제거) | tagIds 배열로 대체 |
| user_analytics | /users/{userId}/analytics | 서브컬렉션으로 이동 |
| user_preferences | /users/{userId}/preferences | 서브컬렉션으로 이동 |

## 🚀 최적화 전략

### 1. 복합 쿼리 최적화
- 자주 사용되는 필드를 문서에 중복 저장 (예: categoryName)
- 배열 필드 활용 (tagIds)

### 2. 읽기 최적화
- 통계 데이터 캐싱 (stats 필드)
- 서브컬렉션 활용으로 필요한 데이터만 로드

### 3. 쓰기 최적화
- 배치 작업 활용
- 트랜잭션으로 일관성 보장

### 4. 비용 최적화
- 인덱스 최소화
- 불필요한 필드 제거
- TTL 활용 (notifications)

## 📝 마이그레이션 고려사항

1. **UUID 변환**: Supabase UUID → Firestore 문서 ID
2. **타임스탬프 변환**: PostgreSQL timestamp → Firestore Timestamp
3. **관계 데이터**: Foreign key → 문서 참조 또는 중복 저장
4. **트리거 대체**: PostgreSQL 트리거 → Cloud Functions
5. **RLS 변환**: Row Level Security → Security Rules

## 🔧 구현 예시

### 구독 생성 예시
```typescript
// Firestore에서 구독 생성
const createSubscription = async (userId: string, data: SubscriptionInput) => {
  const subscriptionRef = doc(collection(db, 'users', userId, 'subscriptions'));
  
  const subscription: Subscription = {
    id: subscriptionRef.id,
    ...data,
    isActive: true,
    isPaused: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    totalPaid: 0,
    paymentCount: 0
  };
  
  // 트랜잭션으로 구독 생성 및 사용자 통계 업데이트
  await runTransaction(db, async (transaction) => {
    // 구독 생성
    transaction.set(subscriptionRef, subscription);
    
    // 사용자 통계 업데이트
    const userRef = doc(db, 'users', userId);
    const userDoc = await transaction.get(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      transaction.update(userRef, {
        'stats.totalSubscriptions': userData.stats.totalSubscriptions + 1,
        'stats.activeSubscriptions': userData.stats.activeSubscriptions + 1,
        'stats.totalMonthlyPayment': userData.stats.totalMonthlyPayment + data.amount,
        'stats.lastUpdated': serverTimestamp()
      });
    }
  });
  
  return subscription;
};
```

### 구독 목록 조회 예시
```typescript
// 활성 구독 목록 조회
const getActiveSubscriptions = async (userId: string) => {
  const q = query(
    collection(db, 'users', userId, 'subscriptions'),
    where('isActive', '==', true),
    orderBy('nextPaymentDate', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

이 스키마 설계는 Firestore의 특성을 최대한 활용하면서도 기존 Supabase 기능을 모두 지원할 수 있도록 구성되었습니다.