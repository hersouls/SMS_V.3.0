# 🗄️ Supabase 데이터베이스 설정 가이드 (업데이트됨)

## 📋 개요

이 가이드는 Moonwave SMS V2.0 애플리케이션을 위한 Supabase 데이터베이스 스키마와 함수들을 설정하는 방법을 설명합니다. **KV 스토어에서 관계형 데이터베이스로 마이그레이션**이 완료되었습니다.

## 🚀 설정 단계

### 1단계: Supabase 프로젝트 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 `bfurhjgnnjgfcafdrotk` 선택
3. **SQL Editor**로 이동

### 2단계: 데이터베이스 스키마 생성

1. **SQL Editor**에서 새 쿼리 생성
2. `database-schema.sql` 파일의 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행

```sql
-- database-schema.sql 내용을 여기에 붙여넣기
```

### 3단계: 데이터베이스 함수 생성

1. 새로운 쿼리 생성
2. `database-functions.sql` 파일의 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행

```sql
-- database-functions.sql 내용을 여기에 붙여넣기
```

### 4단계: Edge Functions 배포

1. **Supabase CLI** 설치 (아직 설치하지 않은 경우)
2. 프로젝트 디렉토리에서 다음 명령어 실행:

```bash
supabase functions deploy make-server-7a0e61a7
```

### 5단계: 데이터 마이그레이션 (기존 사용자)

기존 KV 스토어 데이터를 새로운 데이터베이스로 마이그레이션:

```bash
# 모든 사용자 데이터 마이그레이션
node scripts/migrate-to-database.js

# 특정 사용자 데이터 마이그레이션
node scripts/migrate-to-database.js [userId]
```

## 📊 생성되는 테이블 구조

### 1. `subscriptions` - 구독 테이블 (새로 추가)
- 사용자별 구독 서비스 관리
- 서비스명, URL, 로고, 금액, 결제 주기 등
- 상태 관리 (활성, 일시정지, 취소)
- 알림 설정 및 메모 기능

### 2. `notifications` - 알림 테이블
- 사용자별 알림 관리
- 결제, 갱신, 만료, 시스템 알림 지원
- 우선순위 및 읽음 상태 관리
- 구독과의 관계 설정

### 3. `payment_history` - 결제 내역 테이블
- 구독별 결제 기록
- 통화별 금액 관리
- 결제 상태 추적
- 구독과의 관계 설정

### 4. `subscription_categories` - 구독 카테고리 테이블
- 사용자별 카테고리 관리
- 기본 카테고리 제공
- 색상 및 아이콘 설정

### 5. `subscription_tags` - 구독 태그 테이블
- 사용자별 태그 관리
- 태그별 색상 설정

### 6. `subscription_tag_relations` - 구독-태그 관계 테이블
- 구독과 태그 간의 다대다 관계
- 효율적인 태그 검색 지원

### 7. `user_analytics` - 사용자 분석 테이블
- 일별 사용자 통계
- 카테고리별, 통화별 분석
- 구독 상태별 통계

### 8. `user_preferences` - 사용자 설정 테이블
- 환율, 알림, 테마 등 개인 설정
- 기본값 제공

## 🔧 주요 함수들

### 구독 관련 (새로 추가)
- `get_user_subscriptions()` - 사용자별 구독 목록 조회
- `get_subscription_stats()` - 구독 통계 조회

### 알림 관련
- `get_unread_notifications_count()` - 읽지 않은 알림 개수
- `mark_notifications_as_read()` - 알림 읽음 처리
- `create_payment_notification()` - 결제 알림 생성

### 결제 내역 관련
- `get_monthly_payment_history()` - 월별 결제 내역
- `get_yearly_payment_stats()` - 연도별 결제 통계

### 카테고리 관련
- `get_category_stats()` - 카테고리별 통계

### 태그 관련
- `get_subscription_tags()` - 구독별 태그 조회
- `get_tag_subscription_count()` - 태그별 구독 개수

### 분석 관련
- `generate_daily_analytics()` - 일별 분석 데이터 생성

## 🔒 보안 설정

### Row Level Security (RLS)
모든 테이블에 RLS가 활성화되어 있어 사용자는 자신의 데이터만 접근할 수 있습니다.

### 정책 (Policies)
- **SELECT**: 사용자 자신의 데이터만 조회 가능
- **INSERT**: 사용자 자신의 데이터만 생성 가능
- **UPDATE**: 사용자 자신의 데이터만 수정 가능
- **DELETE**: 사용자 자신의 데이터만 삭제 가능

## 🔄 자동화 기능

### 트리거 (Triggers)
1. **새 사용자 등록 시**: 기본 카테고리 및 설정 자동 생성
2. **사용자 삭제 시**: 관련 데이터 자동 정리 (CASCADE)
3. **데이터 업데이트 시**: `updated_at` 자동 갱신

## 📈 성능 최적화

### 인덱스 (Indexes)
- 사용자 ID 기반 인덱스
- 날짜 기반 인덱스
- 상태 기반 인덱스
- 타입 기반 인덱스
- 카테고리 기반 인덱스
- 결제일 기반 인덱스

### 뷰 (Views)
- `user_subscription_stats`: 사용자별 구독 통계 뷰

## �� 마이그레이션 가이드

### KV 스토어에서 데이터베이스로 마이그레이션

1. **마이그레이션 스크립트 실행**:
   ```bash
   # 모든 사용자 데이터 마이그레이션
   node scripts/migrate-to-database.js
   
   # 특정 사용자 데이터 마이그레이션
   node scripts/migrate-to-database.js [userId]
   ```

2. **마이그레이션 검증**:
   - 스크립트가 자동으로 마이그레이션 결과를 검증합니다
   - KV 스토어와 데이터베이스의 데이터 개수를 비교합니다

3. **마이그레이션 후 확인사항**:
   - 모든 구독 데이터가 정상적으로 이전되었는지 확인
   - 사용자 설정이 올바르게 이전되었는지 확인
   - 애플리케이션이 새로운 데이터베이스를 사용하는지 확인

## 🧪 테스트 방법

### 1. 테이블 생성 확인
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'subscriptions',
  'notifications', 
  'payment_history', 
  'subscription_categories',
  'subscription_tags',
  'subscription_tag_relations',
  'user_analytics',
  'user_preferences'
);
```

### 2. 함수 생성 확인
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

### 3. RLS 정책 확인
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. 마이그레이션 데이터 확인
```sql
-- 구독 데이터 확인
SELECT COUNT(*) as subscription_count FROM subscriptions;

-- 사용자 설정 확인
SELECT COUNT(*) as preferences_count FROM user_preferences;

-- 카테고리 확인
SELECT COUNT(*) as category_count FROM subscription_categories;
```

## 🚨 주의사항

1. **백업**: 실행 전 기존 데이터 백업 권장
2. **권한**: Supabase 프로젝트 관리자 권한 필요
3. **순서**: 스키마 먼저, 함수 나중에 실행
4. **테스트**: 개발 환경에서 먼저 테스트 권장
5. **마이그레이션**: 기존 KV 스토어 데이터 마이그레이션 필수

## 🔧 문제 해결

### 오류 발생 시
1. **구문 오류**: SQL 문법 확인
2. **권한 오류**: 관리자 권한 확인
3. **중복 오류**: 기존 테이블/함수 삭제 후 재실행
4. **마이그레이션 오류**: 스크립트 로그 확인

### 로그 확인
- Supabase Dashboard → Logs에서 실행 로그 확인
- Edge Functions 로그 확인
- 마이그레이션 스크립트 로그 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase 프로젝트 설정
2. SQL 문법 오류
3. 권한 설정
4. 네트워크 연결
5. 마이그레이션 스크립트 실행 결과

## 🎉 완료 확인

성공적으로 설정되면 다음 메시지들이 표시됩니다:
- "Database schema updated successfully!"
- "Database functions updated successfully!"
- 마이그레이션 스크립트: "✅ 마이그레이션 완료!"

---

**이제 KV 스토어 대신 관계형 데이터베이스를 사용하여 더 안정적이고 확장 가능한 구조로 업그레이드되었습니다!** 