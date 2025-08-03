# Git MCP 사용 가이드

## 개요

Git MCP (Model Context Protocol) 서버는 Git 명령어를 MCP를 통해 실행할 수 있게 해주는 서버입니다. 이 서버를 통해 AI 어시스턴트가 Git 작업을 수행할 수 있습니다.

## 설치 및 설정

### 1. Git MCP 서버 파일 생성

`scripts/git-mcp-server.js` 파일이 프로젝트에 생성되어 있습니다.

### 2. MCP 설정 업데이트

`mcp-config.json` 파일에 Git MCP 서버가 설정되어 있습니다:

```json
{
  "mcpServers": {
    "git": {
      "command": "node",
      "args": ["scripts/git-mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 사용 가능한 Git 명령어

### 1. Git 상태 확인
```json
{
  "method": "git/status",
  "params": {}
}
```

### 2. Git 로그 확인
```json
{
  "method": "git/log",
  "params": {
    "limit": 10
  }
}
```

### 3. 브랜치 목록 확인
```json
{
  "method": "git/branches",
  "params": {}
}
```

### 4. 변경사항 커밋
```json
{
  "method": "git/commit",
  "params": {
    "message": "커밋 메시지"
  }
}
```

### 5. 원격 저장소로 푸시
```json
{
  "method": "git/push",
  "params": {
    "branch": "main"
  }
}
```

### 6. 원격 저장소에서 풀
```json
{
  "method": "git/pull",
  "params": {
    "branch": "main"
  }
}
```

### 7. 브랜치 체크아웃
```json
{
  "method": "git/checkout",
  "params": {
    "branch": "브랜치명"
  }
}
```

### 8. 새 브랜치 생성
```json
{
  "method": "git/createBranch",
  "params": {
    "branchName": "새브랜치명"
  }
}
```

### 9. 원격 저장소 정보 확인
```json
{
  "method": "git/remotes",
  "params": {}
}
```

## 응답 형식

### 성공 응답
```json
{
  "method": "git/status",
  "params": {},
  "result": "M  App.tsx\nM  package.json"
}
```

### 오류 응답
```json
{
  "method": "git/status",
  "params": {},
  "error": "fatal: not a git repository"
}
```

## 사용 예시

### 1. 현재 상태 확인
```bash
echo '{"method": "git/status", "params": {}}' | node scripts/git-mcp-server.js
```

### 2. 변경사항 커밋
```bash
echo '{"method": "git/commit", "params": {"message": "Git MCP 서버 추가"}}' | node scripts/git-mcp-server.js
```

### 3. 원격 저장소로 푸시
```bash
echo '{"method": "git/push", "params": {"branch": "main"}}' | node scripts/git-mcp-server.js
```

## 주의사항

1. **Git 저장소 확인**: Git MCP 서버는 Git 저장소 내에서만 작동합니다.
2. **권한 확인**: Git 명령어 실행에 필요한 권한이 있는지 확인하세요.
3. **백업**: 중요한 변경사항을 커밋하기 전에 백업을 만드는 것을 권장합니다.
4. **브랜치 보호**: main 브랜치에 직접 푸시하기 전에 브랜치 보호 규칙을 확인하세요.

## 문제 해결

### 1. Git 저장소가 아닌 경우
```
fatal: not a git repository
```
해결: `git init` 명령어로 Git 저장소를 초기화하세요.

### 2. 권한 오류
```
fatal: Authentication failed
```
해결: Git 자격 증명을 확인하고 설정하세요.

### 3. 충돌 발생
```
error: Your local changes would be overwritten by merge
```
해결: 로컬 변경사항을 커밋하거나 스태시한 후 다시 시도하세요.

## 고급 기능

### 1. 커스텀 Git 명령어 추가
`scripts/git-mcp-server.js` 파일을 수정하여 새로운 Git 명령어를 추가할 수 있습니다.

### 2. 환경 변수 설정
MCP 설정에서 환경 변수를 추가하여 Git 설정을 커스터마이즈할 수 있습니다.

### 3. 로깅 및 디버깅
서버에 로깅 기능을 추가하여 Git 명령어 실행 과정을 추적할 수 있습니다.

## 보안 고려사항

1. **자격 증명 보호**: Git 자격 증명이 안전하게 저장되어 있는지 확인하세요.
2. **권한 제한**: 필요한 최소 권한만 부여하세요.
3. **감사 로그**: 중요한 Git 작업에 대한 감사 로그를 유지하세요.

## 결론

Git MCP 서버를 통해 AI 어시스턴트가 Git 작업을 효율적으로 수행할 수 있습니다. 이 가이드를 참고하여 안전하고 효과적으로 Git MCP를 사용하세요. 