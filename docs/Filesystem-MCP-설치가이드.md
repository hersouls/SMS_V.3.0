# Filesystem MCP 설치 가이드

## 개요
Filesystem MCP (Model Context Protocol)는 파일시스템에 접근하여 코드베이스를 분석하고 AI 모델이 더 정확한 코드 이해를 할 수 있도록 도와주는 도구입니다.

## 설치 방법

### 1. 의존성 설치
```bash
npm run mcp:install
```

### 2. MCP 서버 실행
```bash
npm run mcp:filesystem
```

## 설정 파일

### mcp-config.json
MCP 서버 설정 파일입니다.
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "--workspace", "."],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### .cursor/settings.json
Cursor IDE에서 MCP 서버를 사용하기 위한 설정입니다.

## 기능

### 코드 분석
- TypeScript/JavaScript 파일 분석
- React 컴포넌트 구조 파악
- 의존성 관계 분석
- 코드 품질 평가

### 파일 패턴
**포함 패턴:**
- `**/*.ts` - TypeScript 파일
- `**/*.tsx` - TypeScript React 파일
- `**/*.js` - JavaScript 파일
- `**/*.jsx` - JavaScript React 파일
- `**/*.json` - JSON 설정 파일
- `**/*.md` - 마크다운 문서

**제외 패턴:**
- `node_modules/**` - 의존성 폴더
- `dist/**` - 빌드 결과물
- `build/**` - 빌드 결과물
- `.git/**` - Git 메타데이터
- `*.log` - 로그 파일

## 사용 방법

### 1. 개발 환경에서 실행
```bash
# 개발 서버와 함께 MCP 실행
npm run dev &
npm run mcp:filesystem
```

### 2. 코드 분석 요청
AI 모델에게 다음과 같은 요청을 할 수 있습니다:
- "이 프로젝트의 전체 구조를 분석해줘"
- "Firebase 관련 코드를 찾아줘"
- "React 컴포넌트 간의 의존성을 분석해줘"
- "보안 관련 코드를 검토해줘"

### 3. 분석 결과 활용
- 코드 리팩토링 제안
- 성능 최적화 방안
- 보안 취약점 식별
- 아키텍처 개선 제안

## 문제 해결

### MCP 서버 연결 실패
1. Node.js 버전 확인 (v16 이상 필요)
2. 의존성 재설치: `npm install`
3. MCP 서버 재시작

### 분석 속도가 느린 경우
1. 제외 패턴에 큰 폴더 추가
2. 분석 범위 축소
3. 캐시 활용

## 고급 설정

### 커스텀 분석 규칙
`.cursor/settings.json`에서 분석 규칙을 커스터마이징할 수 있습니다:

```json
{
  "codeAnalysis": {
    "customRules": {
      "security": {
        "patterns": ["password", "token", "secret"],
        "severity": "high"
      },
      "performance": {
        "patterns": ["useEffect", "useMemo", "useCallback"],
        "severity": "medium"
      }
    }
  }
}
```

### 분석 결과 저장
분석 결과를 파일로 저장하려면:
```bash
npm run mcp:filesystem > filesystem-report.json
```

## 참고 자료
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io/)
- [Filesystem MCP GitHub](https://github.com/modelcontextprotocol/server-filesystem) 