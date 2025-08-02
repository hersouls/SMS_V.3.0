# 보안 가이드라인

## 🔐 환경 변수 보안

### ⚠️ 절대 하지 말아야 할 것들

1. **실제 API 키를 코드에 하드코딩하지 마세요**
   ```javascript
   // ❌ 절대 금지
   const apiKey = 'sk-1234567890abcdef';
   ```

2. **환경 변수 파일을 Git에 커밋하지 마세요**
   - `.env`
   - `.env.local`
   - `.env.backup`
   
3. **문서나 README에 실제 키 값을 포함하지 마세요**

### ✅ 올바른 방법

1. **환경 변수 사용**
   ```javascript
   // ✅ 안전한 방법
   const apiKey = process.env.API_KEY;
   
   if (!apiKey) {
     throw new Error('API_KEY 환경 변수가 설정되지 않았습니다.');
   }
   ```

2. **플레이스홀더 사용**
   ```bash
   # .env.example
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🛡️ 데이터베이스 보안

### Row Level Security (RLS)
- 모든 테이블에 RLS 정책 적용
- `SECURITY DEFINER` 뷰 사용 금지
- `auth.users` 테이블 직접 노출 금지

### 안전한 함수 생성
```sql
-- ✅ 안전한 방법: 현재 사용자 데이터만 반환
CREATE OR REPLACE FUNCTION get_my_data()
RETURNS TABLE(...)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM table_name 
  WHERE user_id = auth.uid();
END;
$$;
```

## 🔒 인증 보안

### Google OAuth 설정
1. Google Cloud Console에서 올바른 리다이렉트 URI 설정
2. 개발/프로덕션 환경별로 다른 클라이언트 ID 사용
3. 정기적으로 클라이언트 시크릿 교체

### Supabase 인증
1. 강력한 JWT 시크릿 사용
2. 토큰 만료 시간 적절히 설정
3. 리프레시 토큰 순환 활성화

## 📋 체크리스트

### 개발 시
- [ ] `.env` 파일이 `.gitignore`에 포함되었는지 확인
- [ ] 하드코딩된 키나 시크릿이 없는지 확인
- [ ] 환경 변수 검증 코드 추가

### 배포 시
- [ ] GitHub Secrets으로 환경 변수 설정
- [ ] 프로덕션용 새로운 API 키 생성
- [ ] CORS 설정 확인

### 정기적 점검
- [ ] Supabase Database Linter 실행
- [ ] 의존성 보안 스캔 실행
- [ ] API 키 순환 (3개월마다)

## 🚨 보안 사고 대응

### API 키 노출 시
1. 즉시 해당 키 무효화
2. 새로운 키 생성 및 배포
3. Git 히스토리에서 민감한 정보 제거
4. 관련 서비스 모니터링

### 데이터 유출 시
1. 즉시 영향 범위 파악
2. 관련 사용자에게 알림
3. 보안 패치 적용
4. 사후 분석 및 개선

## 📞 보안 문의

보안 관련 문제 발견 시 즉시 개발팀에 연락하세요.