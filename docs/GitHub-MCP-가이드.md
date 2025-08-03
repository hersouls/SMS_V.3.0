# GitHub MCP 가이드

## 개요

GitHub MCP (Model Context Protocol) 서버는 GitHub API를 통해 저장소, 이슈, 풀 리퀘스트 등을 검색하고 관리할 수 있게 해주는 도구입니다.

## 설치 및 설정

### 1. 패키지 설치

```bash
npm install @missionsquad/mcp-github
```

### 2. GitHub Personal Access Token 생성

1. GitHub에 로그인
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. "Generate new token" 클릭
4. 필요한 권한 선택:
   - `repo` (전체 저장소 접근)
   - `read:user` (사용자 정보 읽기)
   - `read:org` (조직 정보 읽기)
5. 토큰 생성 후 안전한 곳에 저장

### 3. 환경 변수 설정

`.env` 파일에 GitHub 토큰을 추가:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. MCP 설정 업데이트

`mcp-config.json` 파일에 GitHub 서버 설정이 이미 추가되어 있습니다:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@missionsquad/mcp-github"],
      "env": {
        "NODE_ENV": "development",
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

## 사용 가능한 기능

### 1. 저장소 검색
- 저장소 이름, 설명, 언어 등으로 검색
- 스타 수, 포크 수, 최근 업데이트 등으로 필터링

### 2. 이슈 관리
- 이슈 검색 및 조회
- 이슈 생성, 수정, 닫기
- 라벨 관리

### 3. 풀 리퀘스트
- PR 검색 및 조회
- PR 생성, 수정, 머지
- 리뷰 관리

### 4. 사용자 및 조직
- 사용자 정보 조회
- 조직 정보 조회
- 팔로워/팔로잉 관리

## 사용 예시

### 저장소 검색
```
GitHub에서 "React" 관련 저장소를 검색해줘
```

### 이슈 조회
```
특정 저장소의 이슈 목록을 보여줘
```

### 코드 검색
```
특정 키워드로 코드를 검색해줘
```

## 보안 주의사항

1. **토큰 보안**: GitHub 토큰을 안전하게 보관하고 절대 공개하지 마세요
2. **권한 최소화**: 필요한 최소한의 권한만 부여하세요
3. **환경 변수**: `.env` 파일을 Git에 커밋하지 마세요
4. **토큰 갱신**: 정기적으로 토큰을 갱신하세요

## 문제 해결

### 토큰 인증 오류
- 토큰이 올바르게 설정되었는지 확인
- 토큰에 필요한 권한이 있는지 확인
- 토큰이 만료되지 않았는지 확인

### API 제한
- GitHub API는 시간당 요청 수에 제한이 있습니다
- 많은 요청을 보낼 때는 속도를 조절하세요

### 네트워크 오류
- 인터넷 연결 상태 확인
- 방화벽 설정 확인

## 추가 리소스

- [GitHub API 문서](https://docs.github.com/en/rest)
- [Personal Access Tokens 가이드](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [MCP GitHub 서버 문서](https://github.com/missionsquad/mcp-github)

## 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. 토큰 권한
3. 네트워크 연결
4. MCP 서버 로그 