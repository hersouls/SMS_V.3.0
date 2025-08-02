# 🔐 환경 변수 보안 가이드

## ⚠️ 중요한 보안 주의사항

### 1. .env 파일 보안 위험성
- `.env` 파일에는 **민감한 정보**(API 키, 데이터베이스 비밀번호 등)가 포함됩니다
- 잘못 관리하면 **누구나 접근 가능**하여 심각한 보안 침해가 발생할 수 있습니다
- GitHub 등 공개 저장소에 업로드되면 **즉시 위험**에 노출됩니다

### 2. 현재 프로젝트 보안 상태 ✅

#### 보안이 설정된 부분:
- ✅ `.env` 파일이 `.gitignore`에 포함되어 Git 추적에서 제외
- ✅ 민감한 키들은 GitHub Secrets에서 관리
- ✅ 프로덕션 배포 시 환경변수로 주입

#### 추가 확인 필요:
- 🔍 서버 파일 권한 설정
- 🔍 로그 파일에 민감한 정보 노출 여부

## 🛡️ 보안 강화 방법

### 1. 파일 권한 설정
```bash
# .env 파일을 소유자만 읽을 수 있도록 설정
chmod 600 .env

# 모든 환경 파일 권한 확인
ls -la .env*
```

### 2. 환경 변수 분리 전략

#### 개발 환경 (.env.development)
```bash
# 개발용 - 덜 민감한 정보
VITE_APP_URL=http://localhost:5173
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true
```

#### 프로덕션 환경 (GitHub Secrets + 서버 환경변수)
```bash
# 프로덕션용 - 매우 민감한 정보
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_SECRET=...
```

### 3. GitHub Secrets 사용 (권장)

#### 설정된 Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`  
- `VITE_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_S3_*` 관련 키들

#### GitHub Actions에서 사용:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### 4. 환경별 파일 구조 (권장)

```
📁 프로젝트/
├── 📄 .env.example          # 🟢 공개 가능 (샘플)
├── 📄 .env.development      # 🟡 개발용 (덜 민감)
├── 📄 .env.production       # 🔴 절대 커밋 금지
└── 📄 .gitignore           # 🛡️ .env* 파일들 제외
```

## 🚨 절대 하지 말아야 할 것들

### ❌ 위험한 행동:
1. `.env` 파일을 Git에 커밋
2. Discord/Slack 등에 환경 변수 내용 공유
3. 스크린샷에 키 값 노출
4. 로그 파일에 키 값 출력
5. 클라이언트 코드에 `SERVICE_ROLE_KEY` 사용

### ❌ 위험한 코드 예시:
```javascript
// 절대 이렇게 하지 마세요!
console.log('API Key:', process.env.VITE_SUPABASE_ANON_KEY);

// 클라이언트에서 서비스 키 사용 금지!
const supabase = createClient(url, SERVICE_ROLE_KEY); // 🚨 위험!
```

## ✅ 안전한 사용 방법

### 1. 키 타입별 사용 규칙

#### 🟢 Public (Anon) Key - 클라이언트 사용 가능:
```javascript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // ✅ 안전
);
```

#### 🔴 Service Role Key - 서버 전용:
```javascript
// 서버/Edge Function에서만 사용
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ 서버에서만
);
```

### 2. 안전한 개발 워크플로우

```bash
# 1. 샘플 파일 복사
cp .env.example .env

# 2. 실제 값으로 교체 (로컬에서만)
nano .env

# 3. Git 상태 확인 (중요!)
git status  # .env가 나오면 안됨!

# 4. 권한 설정
chmod 600 .env
```

### 3. 팀 공유 방법

#### ✅ 안전한 공유:
- Bitwarden, 1Password 등 비밀번호 관리자 사용
- 회사 내부 보안 시스템 활용
- 직접 대화로 전달 (문자 기록 남기지 않기)

#### ❌ 위험한 공유:
- 메신저/이메일로 키 전송
- 문서에 키 값 기록
- 화면 공유 시 키 노출

## 🔍 보안 점검 체크리스트

### 정기 점검 항목:
- [ ] `.gitignore`에 `.env*` 포함 확인
- [ ] Git 히스토리에 키 값 노출 여부 확인
- [ ] 로그 파일에 민감한 정보 노출 확인
- [ ] 사용하지 않는 키 정리
- [ ] 키 순환(rotation) 주기 확인

### 비상시 대응:
1. **키 노출 발견 시**: 즉시 해당 키 비활성화/재생성
2. **Git 커밋 실수**: `git-secrets` 도구로 히스토리 정리
3. **로그 노출**: 로그 파일 삭제 및 설정 수정

## 📞 도움이 필요한 경우

- GitHub Secrets 설정: GitHub 저장소 → Settings → Secrets
- Supabase 키 관리: Supabase Dashboard → Settings → API
- 보안 문제 발견 시: 즉시 팀 리더에게 보고

---

**🔐 기억하세요**: 보안은 한 번 설정하고 끝이 아닙니다. 지속적인 관리와 점검이 필요합니다!