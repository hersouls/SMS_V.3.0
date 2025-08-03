# GitHub Actions 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구축했습니다. 다양한 워크플로우가 설정되어 있어 코드 품질, 보안, 성능을 지속적으로 모니터링하고 개선할 수 있습니다.

## 워크플로우 목록

### 1. Deploy to GitHub Pages (`deploy.yml`)
- **목적**: GitHub Pages에 자동 배포
- **트리거**: main/master 브랜치 푸시, PR, 수동 실행
- **기능**:
  - 코드 테스트 (linting, type check, Jest)
  - 프로덕션 빌드
  - GitHub Pages 배포

### 2. Security Scan (`security.yml`)
- **목적**: 보안 취약점 검사
- **트리거**: main/master 브랜치 푸시, PR, 매주 월요일 자동 실행
- **기능**:
  - npm audit 실행
  - MCP 보안 스캔
  - 의존성 업데이트 확인

### 3. Test Suite (`test.yml`)
- **목적**: 종합적인 테스트 실행
- **트리거**: main/master 브랜치 푸시, PR, 수동 실행
- **기능**:
  - Jest 단위 테스트
  - Playwright 통합 테스트
  - E2E 테스트
  - API 테스트

### 4. Performance Audit (`performance.yml`)
- **목적**: 성능 최적화 및 분석
- **트리거**: main/master 브랜치 푸시, PR, 매주 월요일 자동 실행
- **기능**:
  - Lighthouse CI 실행
  - 번들 분석
  - Tailwind CSS 분석

### 5. Firebase Deployment (`firebase.yml`)
- **목적**: Firebase 서비스 배포
- **트리거**: main/master 브랜치 푸시, PR, 수동 실행
- **기능**:
  - Firebase 에뮬레이터 테스트
  - Firebase Functions 배포
  - Firebase 호스팅 배포

### 6. MCP Analysis (`mcp.yml`)
- **목적**: Model Context Protocol 분석
- **트리거**: main/master 브랜치 푸시, PR, 매주 월요일 자동 실행
- **기능**:
  - MCP 종합 분석
  - MCP 보안 스캔
  - MCP 성능 감사
  - Git 분석

## 환경 변수 설정

GitHub Secrets에 다음 환경 변수들을 설정해야 합니다:

### 필수 Secrets
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 익명 키
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `FIREBASE_TOKEN`: Firebase 배포 토큰

### 설정 방법
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 각 환경 변수 추가

## 워크플로우 실행 방법

### 자동 실행
- main/master 브랜치에 푸시하면 자동으로 실행됩니다
- Pull Request 생성 시 자동으로 테스트가 실행됩니다

### 수동 실행
1. GitHub 저장소 → Actions 탭
2. 원하는 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 브랜치 선택 후 실행

## 아티팩트 다운로드

각 워크플로우는 실행 결과를 아티팩트로 저장합니다:

### 테스트 결과
- Jest 커버리지 리포트
- Playwright 테스트 리포트
- E2E 테스트 리포트

### 성능 분석
- Lighthouse 리포트
- 번들 분석 결과
- Tailwind CSS 분석

### 보안 검사
- npm audit 결과
- MCP 보안 스캔 결과
- 의존성 업데이트 리포트

## 문제 해결

### 워크플로우 실패 시
1. Actions 탭에서 실패한 워크플로우 확인
2. 로그를 통해 오류 원인 파악
3. 로컬에서 동일한 명령어 실행하여 문제 재현
4. 환경 변수 설정 확인

### 일반적인 문제들
- **의존성 설치 실패**: package-lock.json 충돌 시 `npm ci` 대신 `npm install` 사용
- **빌드 실패**: 환경 변수 누락 확인
- **테스트 실패**: 로컬에서 테스트 실행하여 문제 확인

## 성능 최적화

### 캐싱 활용
- npm 캐시가 자동으로 설정되어 있습니다
- 빌드 시간을 단축하기 위해 의존성 캐싱을 활용합니다

### 병렬 실행
- 독립적인 작업들은 병렬로 실행됩니다
- 전체 실행 시간을 단축할 수 있습니다

## 모니터링

### 워크플로우 상태 확인
- GitHub 저장소 → Actions 탭에서 모든 워크플로우 상태 확인
- 실패한 워크플로우는 즉시 알림을 받을 수 있습니다

### 성능 지표
- Lighthouse 점수 모니터링
- 테스트 커버리지 추적
- 보안 취약점 알림

## 커스터마이징

### 새로운 워크플로우 추가
1. `.github/workflows/` 디렉토리에 새 YAML 파일 생성
2. 필요한 단계와 작업 정의
3. 트리거 조건 설정

### 기존 워크플로우 수정
1. 해당 워크플로우 파일 편집
2. 변경사항 커밋 및 푸시
3. 자동으로 새로운 워크플로우가 실행됩니다

## 보안 고려사항

- 민감한 정보는 GitHub Secrets에 저장
- 환경 변수는 워크플로우에서만 사용
- 외부 서비스 토큰은 정기적으로 갱신

## 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Lighthouse CI 문서](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright 테스트 문서](https://playwright.dev/)
- [Firebase CLI 문서](https://firebase.google.com/docs/cli) 