# 데이터 로딩 문제 해결 가이드

## 문제 진단

로그인 후 데이터를 불러오지 못하는 Supabase 연동 이슈를 해결하기 위한 단계별 가이드입니다.

## 1. 환경 변수 확인

### 필수 환경 변수
```bash
# .env 파일에 다음 변수들이 설정되어 있는지 확인
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_URL=https://sub.moonwave.kr
```

### 환경 변수 확인 방법
1. 프로젝트 루트에 `.env` 파일이 있는지 확인
2. 브라우저 개발자 도구 콘솔에서 환경 변수 확인:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

## 2. Supabase 프로젝트 설정

### 데이터베이스 스키마 확인
```sql
-- subscriptions 테이블이 올바르게 생성되어 있는지 확인
SELECT * FROM information_schema.tables 
WHERE table_name = 'subscriptions';

-- RLS (Row Level Security) 설정 확인
SELECT * FROM pg_policies 
WHERE tablename = 'subscriptions';
```

### RLS 정책 확인
```sql
-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can view own subscriptions" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON subscriptions
FOR DELETE USING (auth.uid() = user_id);
```

## 3. 인증 상태 확인

### 세션 확인
브라우저 개발자 도구에서 다음을 실행:
```javascript
// Supabase 클라이언트 확인
import { supabase } from './utils/supabase/client';

// 현재 세션 확인
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 사용자 정보 확인
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

## 4. 데이터 로딩 디버깅

### 디버거 컴포넌트 사용
1. `/debug` 경로로 이동
2. "진단 실행" 버튼 클릭
3. 각 섹션의 결과 확인:
   - 환경 변수
   - 사용자 정보
   - 인증 상태
   - Supabase 연결
   - 직접 쿼리
   - API 서비스 쿼리

### 수동 디버깅
```javascript
// 1. Supabase 연결 확인
import { checkSupabaseConnection } from './utils/supabase/client';
const isConnected = await checkSupabaseConnection();
console.log('Supabase 연결:', isConnected);

// 2. 인증 상태 확인
import { checkAuthStatus } from './utils/supabase/client';
const authStatus = await checkAuthStatus();
console.log('인증 상태:', authStatus);

// 3. 직접 쿼리 테스트
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id);
console.log('직접 쿼리 결과:', { data, error });
```

## 5. 일반적인 문제와 해결책

### 문제 1: 환경 변수가 설정되지 않음
**증상**: 콘솔에 "Supabase 환경 변수가 설정되지 않았습니다" 에러
**해결책**: `.env` 파일에 올바른 Supabase URL과 키 설정

### 문제 2: RLS 정책 오류
**증상**: "new row violates row-level security policy" 에러
**해결책**: Supabase 대시보드에서 RLS 정책 확인 및 수정

### 문제 3: 세션 만료
**증상**: 로그인은 되지만 데이터를 불러올 수 없음
**해결책**: 
1. 브라우저에서 로그아웃 후 다시 로그인
2. 세션 토큰 갱신 확인

### 문제 4: 네트워크 연결 문제
**증상**: "데이터베이스 연결에 실패했습니다" 에러
**해결책**:
1. 인터넷 연결 확인
2. Supabase 프로젝트 상태 확인
3. 방화벽 설정 확인

## 6. 개발 환경 설정

### 로컬 개발 시
```bash
# 개발 서버 시작
npm run dev

# 환경 변수 확인
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### 프로덕션 배포 시
```bash
# 환경 변수 설정 확인
# GitHub Pages나 다른 호스팅 서비스에서 환경 변수 설정
```

## 7. 로그 확인

### 브라우저 콘솔 로그
개발자 도구에서 다음 로그들을 확인:
- `🔍 Supabase 환경 변수 확인`
- `🔑 세션 상태`
- `📊 구독 데이터 로딩 시작`
- `✅ 인증 확인됨`

### 네트워크 탭
1. Network 탭 열기
2. 페이지 새로고침
3. Supabase API 호출 확인
4. 응답 상태 코드 확인 (200, 401, 403 등)

## 8. 추가 디버깅 도구

### Supabase 대시보드
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. Authentication > Users에서 사용자 확인
4. Table Editor에서 데이터 확인
5. Logs에서 API 호출 로그 확인

### SQL 에디터에서 직접 확인
```sql
-- 사용자별 구독 데이터 확인
SELECT * FROM subscriptions 
WHERE user_id = 'your-user-id';

-- RLS 정책 확인
SELECT * FROM pg_policies 
WHERE tablename = 'subscriptions';
```

## 9. 문제 해결 체크리스트

- [ ] 환경 변수가 올바르게 설정됨
- [ ] Supabase 프로젝트가 활성 상태
- [ ] 데이터베이스 스키마가 올바르게 생성됨
- [ ] RLS 정책이 올바르게 설정됨
- [ ] 사용자가 올바르게 인증됨
- [ ] 세션이 유효함
- [ ] 네트워크 연결이 정상임
- [ ] API 호출이 성공함

## 10. 지원 및 문의

문제가 지속되는 경우:
1. 브라우저 콘솔의 전체 로그 캡처
2. 디버거 컴포넌트의 결과 스크린샷
3. Supabase 대시보드의 로그 확인
4. 네트워크 탭의 API 호출 결과

이 정보들을 바탕으로 더 구체적인 해결책을 제공할 수 있습니다.