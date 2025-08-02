# 데이터 로딩 디버깅 가이드

로그인은 성공하지만 데이터가 로딩되지 않는 문제를 해결하기 위한 디버깅 도구들과 절차를 안내합니다.

## 🛠️ 추가된 디버깅 도구들

### 1. 데이터 로딩 디버거 (DataLoadingDebugger)
- **접근 경로**: `/data-debug`
- **기능**: 인증 상태, 직접 Supabase 쿼리, API 서비스 쿼리 등을 종합적으로 테스트
- **사용법**: 로그인 후 `/data-debug` 경로로 이동하여 "디버그 테스트 실행" 버튼 클릭

### 2. 빠른 데이터 테스트 (QuickDataTest)
- **위치**: 대시보드 하단 (개발 환경에서만 표시)
- **기능**: Supabase 직접 쿼리를 통한 데이터 접근 테스트
- **사용법**: 대시보드에서 "데이터 접근 테스트" 버튼 클릭

### 3. 강화된 콘솔 로깅
- **위치**: 브라우저 개발자 도구 콘솔
- **기능**: 
  - 🔄 `loadUserData` 함수 실행 과정 추적
  - 🔑 Access Token 설정 확인
  - 📊 Supabase 쿼리 결과 확인
  - 🏠 Dashboard 렌더링 시 데이터 상태 확인

## 📝 디버깅 절차

### 1단계: 브라우저 콘솔 확인
1. 개발자 도구 열기 (F12)
2. Console 탭으로 이동
3. 로그인 후 다음 로그들을 확인:
   - `🔑 Initial auth - Setting access token`
   - `🚀 Initial auth - Calling loadUserData`
   - `🔄 loadUserData started`
   - `📊 Loading subscriptions...`
   - `📊 Subscriptions loaded`

### 2단계: 데이터 로딩 디버거 사용
1. 로그인 후 `/data-debug` 이동
2. "디버그 테스트 실행" 버튼 클릭
3. 결과에서 다음 사항 확인:
   - `authStatus.hasSession`: true인지 확인
   - `authStatus.accessToken`: "present"인지 확인
   - `directSupabaseQuery.success`: true인지 확인
   - `apiServiceQuery.success`: true인지 확인

### 3단계: 빠른 데이터 테스트 사용
1. 대시보드에서 "데이터 접근 테스트" 버튼 클릭
2. 결과에서 다음 사항 확인:
   - `✅ Auth session OK` 메시지 확인
   - `✅ User-specific subscriptions: X` 에서 X가 예상 값인지 확인

## 🔍 가능한 문제와 해결책

### 문제 1: Access Token이 없음
**증상**: `accessToken: "missing"` 또는 관련 오류
**해결책**: 
- 로그아웃 후 다시 로그인
- 브라우저 캐시 및 쿠키 삭제
- localStorage 초기화

### 문제 2: RLS (Row Level Security) 정책 문제
**증상**: `directSupabaseQuery.error`에 권한 관련 오류
**해결책**: 
- `/rls-debug` 페이지에서 RLS 정책 확인
- Supabase 대시보드에서 정책 설정 검토

### 문제 3: 데이터가 없음
**증상**: 쿼리는 성공하지만 `dataCount: 0`
**해결책**: 
- Supabase 대시보드에서 실제 데이터 존재 여부 확인
- 다른 사용자의 데이터가 보이는지 확인 (RLS 정책 문제일 수 있음)

### 문제 4: API 서비스 오류
**증상**: `apiServiceQuery.success: false`
**해결책**: 
- 네트워크 탭에서 API 요청 상태 확인
- Supabase Functions 상태 확인
- 직접 Supabase 쿼리와 API 서비스 쿼리 결과 비교

## 🚨 긴급 해결 방법

만약 위의 디버깅 도구들로도 문제를 찾을 수 없다면:

1. **강제 새로고침**: Ctrl+F5 (캐시 무시 새로고침)
2. **시크릿 모드**: 새 시크릿 창에서 로그인 시도
3. **네트워크 확인**: 네트워크 탭에서 실패한 요청 확인
4. **Supabase 직접 접근**: Supabase 대시보드에서 직접 데이터 확인

## 📞 추가 지원

위의 모든 방법을 시도해도 문제가 해결되지 않으면:
1. 콘솔 로그 전체 복사
2. 디버깅 도구 결과 스크린샷
3. 네트워크 요청 실패 정보
4. 브라우저 및 환경 정보

이 정보들을 바탕으로 더 구체적인 해결책을 제시할 수 있습니다.