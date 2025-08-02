# 🚀 Supabase 연동 테스트 가이드

Supabase 데이터베이스, 인증, Real-time 등 모든 기능을 수동으로 테스트할 수 있는 도구입니다.

## 📋 테스트 도구 접근 방법

### 방법 1: 웹 브라우저에서 직접 접근
```
https://your-domain.com/supabase-test
```

예시:
```
http://localhost:5173/supabase-test
```

### 방법 2: 브라우저 콘솔에서 직접 실행
개발자 도구(F12)를 열고 콘솔에서 다음 명령어 실행:

```javascript
// 전체 테스트 실행
window.supabaseTest.runAllTests()

// 개별 테스트 실행
window.supabaseTest.testConnection()
window.supabaseTest.testAuth()
window.supabaseTest.testCRUD()

// 특정 그룹 테스트
window.supabaseTest.runAuthTests()
window.supabaseTest.runDatabaseTests()

// 테스트 결과 확인
window.supabaseTest.getResults()
```

## 🧪 테스트 종류

### 1. 환경 설정 테스트 (`🔧 환경 설정`)
- `VITE_SUPABASE_URL` 환경 변수 확인
- `VITE_SUPABASE_ANON_KEY` 환경 변수 확인
- Supabase 클라이언트 생성 확인

### 2. 연결 테스트 (`🌐 연결 테스트`)
- Supabase 데이터베이스 연결 상태 확인
- 네트워크 연결 및 권한 확인

### 3. 인증 테스트 (`🔐 인증 테스트`)
- 현재 사용자 세션 상태 확인
- 토큰 만료 시간 확인
- 사용자 정보 조회

### 4. 데이터베이스 스키마 테스트 (`📊 데이터베이스`)
확인하는 테이블들:
- `subscriptions` - 구독 정보
- `user_preferences` - 사용자 설정
- `notifications` - 알림 정보
- `categories` - 카테고리
- `tags` - 태그
- `statistics_cache` - 통계 캐시

### 5. CRUD 테스트 (`📝 CRUD 테스트`)
⚠️ **주의: 로그인이 필요합니다**
- 테스트 데이터 생성 (CREATE)
- 데이터 조회 (READ)
- 데이터 수정 (UPDATE)
- 데이터 삭제 (DELETE)

### 6. Real-time 테스트 (`⚡ Real-time`)
- Real-time 채널 구독
- 실시간 이벤트 수신 테스트
- 자동으로 5초 후 구독 해제

### 7. 스토리지 테스트 (`📁 스토리지`)
- 스토리지 버킷 목록 조회
- 파일 업로드/다운로드 권한 확인

## 🔍 그룹 테스트

### 인증 관련 테스트만 (`🔐 인증만 테스트`)
- 환경 설정
- 연결 테스트
- 인증 상태 확인

### 데이터베이스 관련 테스트만 (`📊 DB만 테스트`)
- 연결 테스트
- 스키마 테스트
- CRUD 테스트

## 📊 테스트 결과 해석

### 성공 상태
- ✅ 녹색 체크: 테스트 성공
- 성공률 100%: 모든 기능이 정상 작동

### 실패 상태  
- ❌ 빨간색 X: 테스트 실패
- 오류 메시지를 확인하여 문제 원인 파악

### 일반적인 오류 및 해결 방법

#### 1. 환경 변수 오류
```
❌ Supabase URL 설정: 미설정
❌ Supabase Anon Key 설정: 미설정
```
**해결방법**: `.env` 파일에 환경 변수 추가
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. 연결 오류
```
❌ 데이터베이스 연결: Connection failed
```
**해결방법**: 
- Supabase URL 확인
- 네트워크 연결 확인
- Supabase 프로젝트 상태 확인

#### 3. 인증 오류
```
❌ 사용자 인증 상태: 로그아웃 상태
```
**해결방법**: 로그인 후 다시 테스트

#### 4. 테이블 접근 오류
```
❌ 테이블 subscriptions: permission denied
```
**해결방법**: 
- RLS(Row Level Security) 정책 확인
- 사용자 권한 확인
- 테이블 존재 여부 확인

## 🛠️ 파일 구조

```
utils/
├── supabase-manual-test.ts     # 테스트 로직
└── supabase/
    └── client.ts               # Supabase 클라이언트

components/
└── SupabaseTestDashboard.tsx   # 테스트 UI

App.tsx                         # 라우트 설정
```

## 💡 활용 팁

1. **정기적인 테스트**: 새로운 기능 배포 전 전체 테스트 실행
2. **단계별 테스트**: 문제 발생시 개별 테스트로 원인 파악
3. **로그 모니터링**: 브라우저 콘솔에서 상세한 로그 확인
4. **결과 저장**: 테스트 결과를 스크린샷으로 저장하여 문제 추적

## 🚨 주의사항

- **CRUD 테스트**는 실제 데이터를 생성/수정/삭제하므로 주의
- **Real-time 테스트**는 5초간 실행되므로 다른 작업과 동시 진행 주의
- 테스트 환경에서만 사용 권장 (프로덕션 환경 주의)

## 📞 문제 해결

테스트 중 문제가 발생하면:
1. 브라우저 콘솔에서 상세 오류 메시지 확인
2. Supabase 대시보드에서 프로젝트 상태 확인
3. 네트워크 연결 및 환경 변수 재확인