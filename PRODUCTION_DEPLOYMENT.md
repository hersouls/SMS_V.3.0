# Moonwave SMS V3.0 프로덕션 배포 가이드

## 🚀 개요

이 가이드는 Moonwave SMS V3.0의 최적화된 데이터베이스 구조를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 준비사항

1. **Supabase 프로젝트 접근 권한**
2. **기존 데이터 백업** (선택사항)
3. **환경 변수 설정 확인**

## 🔧 배포 단계

### 1단계: 데이터베이스 스키마 배포

```sql
-- Supabase SQL Editor에서 실행
-- 파일: supabase/deploy-production-schema.sql
```

1. Supabase 대시보드 → SQL Editor 이동
2. `supabase/deploy-production-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. 실행 버튼 클릭
5. 에러 없이 완료되는지 확인

### 2단계: API 서비스 업데이트

기존 `utils/api.ts`를 새로운 프로덕션 API로 교체:

```typescript
// utils/api.ts 파일에서
import { apiService } from './api-production';
export { apiService };
```

또는 직접 교체:

```bash
# 백업 생성
cp utils/api.ts utils/api-backup.ts

# 새 API 적용
cp utils/api-production.ts utils/api.ts
```

### 3단계: 프론트엔드 호환성 확인

다음 컴포넌트들이 새 API와 호환되는지 확인:

- `components/Dashboard.tsx`
- `components/AllSubscriptions.tsx`
- `components/AddEditSubscription.tsx`
- `components/Settings.tsx`
- `components/Notifications.tsx`

### 4단계: 환경 변수 확인

`.env` 파일에 다음 변수들이 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id (선택사항)
```

## 🧪 테스트

### 1. 기본 기능 테스트

1. 회원가입/로그인 테스트
2. 구독 CRUD 작업 테스트
3. 설정 변경 테스트
4. 알림 기능 테스트

### 2. Supabase 테스트 대시보드 사용

브라우저에서 `/supabase-test` 경로 접속 후 전체 테스트 실행

### 3. 개발자 도구 콘솔 확인

- 에러 메시지 없는지 확인
- API 응답 시간 확인
- 네트워크 탭에서 요청/응답 상태 확인

## 🔄 롤백 계획

문제 발생 시 롤백 방법:

### 데이터베이스 롤백

```sql
-- 기존 테이블 구조로 복원 (필요시)
-- 사전에 백업한 스키마 사용
```

### API 롤백

```bash
# 백업된 API 복원
cp utils/api-backup.ts utils/api.ts
```

## 📊 성능 최적화

### 인덱스 확인

배포 후 다음 인덱스들이 제대로 생성되었는지 확인:

```sql
-- 인덱스 상태 확인
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### RLS 정책 확인

```sql
-- RLS 정책 상태 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🚨 주의사항

1. **데이터 손실**: 새 스키마는 기존 데이터를 완전히 삭제합니다
2. **컬럼명 변경**: `userId` → `user_id` 등 컬럼명이 변경되었습니다
3. **트리거 함수**: 새 사용자 생성 시 자동으로 기본 설정이 생성됩니다
4. **RLS 정책**: 모든 테이블에 사용자별 접근 제한이 적용됩니다

## 🔗 주요 변경사항

### 데이터베이스 구조

- **통일된 컬럼명**: snake_case 사용 (`user_id`, `created_at` 등)
- **강화된 제약조건**: 데이터 무결성 보장
- **최적화된 인덱스**: 쿼리 성능 향상
- **RLS 보안**: 사용자별 데이터 격리

### API 변화

- **자동 형식 변환**: DB와 프론트엔드 간 컬럼명 자동 매핑
- **향상된 에러 처리**: 구체적인 에러 메시지 제공
- **성능 최적화**: 불필요한 쿼리 제거

### 프론트엔드 호환성

- **기존 컴포넌트 유지**: API 레이어에서 형식 변환 처리
- **타입 안정성**: TypeScript 타입 정의 유지
- **상태 관리**: React Context API 구조 유지

## 📞 지원

배포 과정에서 문제가 발생하면:

1. **로그 확인**: 브라우저 개발자 도구 콘솔
2. **Supabase 로그**: Supabase 대시보드 → Logs
3. **테스트 실행**: `/supabase-test` 페이지에서 진단

## ✅ 배포 체크리스트

- [ ] 기존 데이터 백업 완료
- [ ] 새 스키마 배포 완료
- [ ] API 서비스 업데이트 완료
- [ ] 환경 변수 확인 완료
- [ ] 회원가입/로그인 테스트 완료
- [ ] 구독 관리 기능 테스트 완료
- [ ] 설정 변경 테스트 완료
- [ ] 알림 기능 테스트 완료
- [ ] 성능 테스트 완료
- [ ] 에러 로그 확인 완료

---

**배포 성공 시 Moonwave SMS V3.0은 더욱 안정적이고 확장 가능한 구조로 동작합니다! 🎉**