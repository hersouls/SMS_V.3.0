# Lucide Icons 가이드

## 개요

이 프로젝트에서는 Lucide Icons를 쉽게 사용할 수 있도록 도우미 스크립트를 제공합니다.

## 설치

Lucide React는 이미 설치되어 있습니다:

```bash
npm install lucide-react
```

## 사용법

### 1. 도우미 스크립트 사용

```bash
# 모든 아이콘 목록 보기
node scripts/lucide-icons-helper.js list

# 아이콘 검색
node scripts/lucide-icons-helper.js search "user"

# 특정 아이콘 정보 보기
node scripts/lucide-icons-helper.js info "user"

# 아이콘 컴포넌트 생성
node scripts/lucide-icons-helper.js generate "user"
```

### 2. React 컴포넌트에서 사용

```jsx
import { User, Settings, Home } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <User size={24} />
      <Settings size={20} color="blue" />
      <Home className="w-6 h-6" />
    </div>
  );
}
```

### 3. 아이콘 속성

- `size`: 아이콘 크기 (기본값: 24)
- `color`: 아이콘 색상 (기본값: "currentColor")
- `strokeWidth`: 선 두께 (기본값: 2)
- `className`: CSS 클래스

## 자주 사용하는 아이콘

### 네비게이션
- `home`: 홈
- `settings`: 설정
- `user`: 사용자
- `search`: 검색
- `menu`: 메뉴

### 액션
- `plus`: 추가
- `edit`: 편집
- `trash`: 삭제
- `check`: 확인
- `x`: 취소

### 상태
- `heart`: 좋아요
- `star`: 별점
- `bell`: 알림
- `eye`: 보기
- `lock`: 잠금

### 미디어
- `play`: 재생
- `pause`: 일시정지
- `volume`: 볼륨
- `music`: 음악
- `video`: 비디오

## 커스텀 아이콘 컴포넌트 생성

```jsx
import { User } from 'lucide-react';

function UserIcon({ size = 24, color = "currentColor", ...props }) {
  return <User size={size} color={color} {...props} />;
}

export default UserIcon;
```

## 아이콘 검색 팁

1. **이름으로 검색**: `user`, `settings`, `home`
2. **기능으로 검색**: `search`, `edit`, `delete`
3. **카테고리로 검색**: `music`, `video`, `social`

## 예시

### 기본 사용법
```jsx
import { User, Mail, Phone } from 'lucide-react';

function ContactInfo() {
  return (
    <div className="flex items-center space-x-2">
      <User size={20} />
      <span>사용자 정보</span>
      <Mail size={16} />
      <span>이메일</span>
      <Phone size={16} />
      <span>전화번호</span>
    </div>
  );
}
```

### 조건부 아이콘
```jsx
import { Heart, HeartOff } from 'lucide-react';

function LikeButton({ isLiked, onClick }) {
  return (
    <button onClick={onClick}>
      {isLiked ? <Heart fill="red" /> : <HeartOff />}
    </button>
  );
}
```

### 애니메이션과 함께
```jsx
import { RotateCw } from 'lucide-react';

function LoadingSpinner() {
  return (
    <RotateCw className="animate-spin" size={24} />
  );
}
```

## 참고 자료

- [Lucide Icons 공식 사이트](https://lucide.dev/)
- [Lucide React 문서](https://lucide.dev/guide/packages/lucide-react)
- [아이콘 갤러리](https://lucide.dev/icons/) 