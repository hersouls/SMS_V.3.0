# Tailwind CSS MCP 가이드

## 개요

이 프로젝트는 Tailwind CSS와 Model Context Protocol (MCP)을 통합하여 향상된 개발 경험을 제공합니다.

## 설치된 플러그인

### 기본 플러그인
- `@tailwindcss/forms` - 폼 요소 스타일링
- `@tailwindcss/typography` - 타이포그래피 스타일링
- `@tailwindcss/aspect-ratio` - 종횡비 유틸리티
- `@tailwindcss/line-clamp` - 텍스트 줄 제한
- `tailwindcss-animate` - 애니메이션 유틸리티

### 커스텀 플러그인
- 한국어 타이포그래피 지원
- 글래스모피즘 효과
- 페이즈별 색상 시스템
- 향상된 버튼 효과
- 터치 타겟 최적화
- 키보드 네비게이션 지원

## 사용법

### 1. 개발 모드 시작

```bash
# 기본 Tailwind CSS 감시 모드
npm run tailwind:build

# MCP 서버를 통한 감시 모드
npm run tailwind:mcp:watch
```

### 2. CSS 분석

```bash
# Tailwind CSS 사용량 분석
npm run tailwind:analyze

# MCP 서버를 통한 분석
npm run tailwind:mcp:analyze
```

### 3. 프로덕션 빌드

```bash
# 기본 프로덕션 빌드
npm run tailwind:build-prod

# MCP 서버를 통한 프로덕션 빌드
npm run tailwind:mcp:build
```

## 설정 파일

### tailwind.config.js
메인 Tailwind CSS 설정 파일입니다.

### tailwind-mcp-config.json
MCP 서버 설정 파일입니다.

### tailwind.config.mcp.js
MCP 전용 Tailwind 설정 파일입니다.

## 커스텀 유틸리티

### 한국어 타이포그래피
```css
.text-xs-ko    /* 작은 텍스트 */
.text-sm-ko    /* 작은 텍스트 */
.text-base-ko  /* 기본 텍스트 */
.text-lg-ko    /* 큰 텍스트 */
.text-xl-ko    /* 매우 큰 텍스트 */
.text-2xl-ko   /* 2배 큰 텍스트 */
.text-3xl-ko   /* 3배 큰 텍스트 */
.text-4xl-ko   /* 4배 큰 텍스트 */
.text-5xl-ko   /* 5배 큰 텍스트 */
.text-6xl-ko   /* 6배 큰 텍스트 */
.text-7xl-ko   /* 7배 큰 텍스트 */
```

### 글래스모피즘
```css
.glass-subtle   /* 미묘한 글래스 효과 */
.glass-light    /* 밝은 글래스 효과 */
.glass-default  /* 기본 글래스 효과 */
.glass-strong   /* 강한 글래스 효과 */
.glass-intense  /* 강렬한 글래스 효과 */
```

### 페이즈 색상
```css
.bg-phase-beginning-500  /* 시작 페이즈 */
.bg-phase-growth-500     /* 성장 페이즈 */
.bg-phase-challenge-500  /* 도전 페이즈 */
.bg-phase-shine-500      /* 빛나는 페이즈 */
```

### 향상된 버튼
```css
.wave-button-glass-enhanced    /* 글래스 버튼 */
.wave-button-primary-enhanced  /* 주요 버튼 */
.wave-button-secondary-enhanced /* 보조 버튼 */
```

### 터치 타겟
```css
.touch-target     /* 기본 터치 타겟 (44px) */
.touch-target-sm  /* 작은 터치 타겟 (36px) */
.touch-target-lg  /* 큰 터치 타겟 (52px) */
```

### 키보드 네비게이션
```css
.keyboard-navigation  /* 키보드 포커스 스타일 */
```

### 디버그 스크린 (개발 모드)
```css
.debug-screens  /* 현재 화면 크기 표시 */
```

## 개발 도구

### 스크립트
- `scripts/tailwind-mcp.js` - MCP 서버 스크립트

### 명령어
```bash
# MCP 서버 도움말
node scripts/tailwind-mcp.js

# 감시 모드
node scripts/tailwind-mcp.js watch

# 분석 모드
node scripts/tailwind-mcp.js analyze

# 빌드 모드
node scripts/tailwind-mcp.js build
```

## 파일 구조

```
SMS_V.3.0/
├── tailwind.config.js          # 메인 Tailwind 설정
├── tailwind.config.mcp.js      # MCP 전용 설정
├── tailwind-mcp-config.json    # MCP 서버 설정
├── scripts/
│   └── tailwind-mcp.js        # MCP 서버 스크립트
└── docs/
    └── Tailwind-MCP-가이드.md  # 이 가이드
```

## 문제 해결

### 1. 설정 파일을 찾을 수 없는 경우
```bash
# 설정 파일 확인
ls -la tailwind*.js
ls -la tailwind-mcp-config.json
```

### 2. CSS 파일을 찾을 수 없는 경우
```bash
# CSS 파일 확인
ls -la styles/globals.css
```

### 3. 플러그인 오류
```bash
# 의존성 재설치
npm install

# 플러그인 재설치
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tailwindcss/line-clamp
```

## 성능 최적화

### 1. 프로덕션 빌드
```bash
npm run tailwind:mcp:build
```

### 2. 사용하지 않는 CSS 제거
```bash
npm run tailwind:mcp:analyze
```

### 3. 캐시 활용
- `dist/` 디렉토리의 CSS 파일을 캐시에 저장
- 개발 시에는 감시 모드 사용

## 추가 정보

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [한국어 타이포그래피 가이드](https://www.notion.so/ko-kr/help/typography) 