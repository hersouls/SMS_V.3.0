# GitHub Repository Manager 가이드

## 개요

GitHub Repository Manager는 GitHub CLI를 기반으로 한 MCP(Model Context Protocol) 서버로, GitHub 리포지토리 관리를 위한 다양한 기능을 제공합니다.

## 설치된 구성 요소

### 1. GitHub CLI
- **설치 상태**: ✅ 완료
- **버전**: 2.76.2
- **경로**: `C:\Program Files\GitHub CLI\gh.exe`

### 2. MCP 서버
- **파일**: `scripts/github-repo-manager.js`
- **설정**: `mcp-config.json`

## 기능 목록

### 리포지토리 관리
- `list_repositories`: 사용자의 모든 리포지토리 목록 조회
- `get_repository_info`: 특정 리포지토리 정보 조회
- `create_repository`: 새 리포지토리 생성
- `delete_repository`: 리포지토리 삭제
- `clone_repository`: 리포지토리 클론

### 이슈 관리
- `list_issues`: 리포지토리의 이슈 목록 조회
- `create_issue`: 새 이슈 생성

### Pull Request 관리
- `list_pull_requests`: Pull Request 목록 조회
- `create_pull_request`: 새 Pull Request 생성

### 브랜치 관리
- `list_branches`: 브랜치 목록 조회
- `create_branch`: 새 브랜치 생성

### 릴리스 관리
- `list_releases`: 릴리스 목록 조회
- `create_release`: 새 릴리스 생성

## 설정 방법

### 1. GitHub CLI 인증

먼저 GitHub CLI에 로그인해야 합니다:

```bash
# GitHub CLI 인증
& "C:\Program Files\GitHub CLI\gh.exe" auth login
```

인증 방법을 선택하세요:
- **HTTPS**: GitHub.com (권장)
- **SSH**: SSH 키 사용

### 2. MCP 설정 확인

`mcp-config.json` 파일에서 GitHub Repository Manager 설정이 올바르게 되어 있는지 확인:

```json
{
  "mcpServers": {
    "github-repo-manager": {
      "command": "node",
      "args": ["scripts/github-repo-manager.js"],
      "env": {
        "NODE_ENV": "development",
        "GITHUB_CLI_PATH": "C:\\Program Files\\GitHub CLI\\gh.exe"
      }
    }
  }
}
```

## 사용 예제

### 리포지토리 목록 조회
```javascript
// 사용자의 모든 리포지토리 조회
const repositories = await listRepositories();
```

### 새 리포지토리 생성
```javascript
// 공개 리포지토리 생성
await createRepository("my-new-repo", "새로운 프로젝트", false);

// 비공개 리포지토리 생성
await createRepository("private-repo", "비공개 프로젝트", true);
```

### 이슈 생성
```javascript
// 새 이슈 생성
await createIssue("username/repo-name", "버그 리포트", "이슈 내용...");
```

### Pull Request 생성
```javascript
// 새 Pull Request 생성
await createPullRequest("username/repo-name", "기능 추가", "변경 사항...", "feature-branch", "main");
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `GITHUB_CLI_PATH` | GitHub CLI 실행 파일 경로 | `C:\Program Files\GitHub CLI\gh.exe` |
| `NODE_ENV` | Node.js 환경 | `development` |

## 문제 해결

### 1. GitHub CLI 인증 오류
```bash
# 인증 상태 확인
& "C:\Program Files\GitHub CLI\gh.exe" auth status

# 재인증
& "C:\Program Files\GitHub CLI\gh.exe" auth logout
& "C:\Program Files\GitHub CLI\gh.exe" auth login
```

### 2. 권한 오류
- GitHub CLI가 관리자 권한으로 설치되었는지 확인
- PATH 환경 변수에 GitHub CLI 경로가 추가되었는지 확인

### 3. MCP 서버 연결 오류
- `mcp-config.json` 파일의 경로 설정 확인
- Node.js가 설치되어 있는지 확인
- 필요한 의존성이 설치되어 있는지 확인

## 보안 고려사항

1. **토큰 관리**: GitHub CLI는 안전하게 토큰을 관리합니다
2. **권한 범위**: 필요한 최소 권한만 부여하세요
3. **로컬 저장**: 인증 정보는 로컬에 안전하게 저장됩니다

## 추가 기능

### 자동화 스크립트
GitHub Repository Manager를 사용하여 자동화 스크립트를 작성할 수 있습니다:

```javascript
// 배포 자동화 예제
async function deployToGitHub() {
  // 1. 리포지토리 생성
  await createRepository("deployment-repo", "자동 배포용 리포지토리");
  
  // 2. 이슈 생성
  await createIssue("username/deployment-repo", "배포 알림", "새로운 배포가 완료되었습니다.");
  
  // 3. 릴리스 생성
  await createRelease("username/deployment-repo", "v1.0.0", "첫 번째 릴리스", "초기 배포");
}
```

## 지원 및 문의

문제가 발생하거나 추가 기능이 필요한 경우:
1. GitHub CLI 문서: https://cli.github.com/
2. MCP 프로토콜 문서: https://modelcontextprotocol.io/
3. 프로젝트 이슈 트래커 활용

## 업데이트 기록

- **v1.0.0**: 초기 버전
  - 기본 리포지토리 관리 기능
  - 이슈 및 Pull Request 관리
  - 브랜치 및 릴리스 관리 