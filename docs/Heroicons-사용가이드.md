# Heroicons 사용 가이드

## 개요

이 프로젝트에서는 Heroicons를 React 컴포넌트로 쉽게 사용할 수 있도록 래퍼 컴포넌트를 제공합니다.

## 설치

```bash
npm install @heroicons/react
```

## 기본 사용법

### 1. HeroIcon 컴포넌트 사용

```tsx
import { HeroIcon } from './components/ui/heroicons';

// 기본 사용법
<HeroIcon name="HomeIcon" size={24} className="text-blue-500" />

// Solid 스타일 사용
<HeroIcon name="HeartIcon" size={32} className="text-red-500" variant="solid" />
```

### 2. 미리 정의된 아이콘 사용

```tsx
import { Icons } from './components/ui/heroicons';

// 간단한 사용법
<Icons.Home size={24} className="text-blue-500" />
<Icons.User size={32} className="text-green-500" />
<Icons.Settings size={28} className="text-purple-500" />
```

## Props

### HeroIcon Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `name` | string | - | 아이콘 이름 (필수) |
| `size` | number | 24 | 아이콘 크기 |
| `className` | string | '' | CSS 클래스 |
| `variant` | 'outline' \| 'solid' | 'outline' | 아이콘 스타일 |

## 사용 가능한 아이콘들

### Navigation
- `Icons.Home` - 홈 아이콘
- `Icons.User` - 사용자 아이콘
- `Icons.Settings` - 설정 아이콘
- `Icons.Menu` - 메뉴 아이콘
- `Icons.Close` - 닫기 아이콘

### Actions
- `Icons.Plus` - 추가 아이콘
- `Icons.Minus` - 빼기 아이콘
- `Icons.Edit` - 편집 아이콘
- `Icons.Delete` - 삭제 아이콘
- `Icons.Search` - 검색 아이콘

### Communication
- `Icons.Mail` - 메일 아이콘
- `Icons.Phone` - 전화 아이콘
- `Icons.Chat` - 채팅 아이콘

### Status
- `Icons.Check` - 확인 아이콘
- `Icons.Error` - 오류 아이콘
- `Icons.Warning` - 경고 아이콘
- `Icons.Info` - 정보 아이콘

### Media
- `Icons.Play` - 재생 아이콘
- `Icons.Pause` - 일시정지 아이콘
- `Icons.Volume` - 볼륨 아이콘
- `Icons.Music` - 음악 아이콘

### Finance
- `Icons.CreditCard` - 신용카드 아이콘
- `Icons.Currency` - 통화 아이콘
- `Icons.Chart` - 차트 아이콘

### Time
- `Icons.Calendar` - 달력 아이콘
- `Icons.Clock` - 시계 아이콘

### Data
- `Icons.Database` - 데이터베이스 아이콘
- `Icons.Cloud` - 클라우드 아이콘
- `Icons.Download` - 다운로드 아이콘
- `Icons.Upload` - 업로드 아이콘

### Social
- `Icons.Heart` - 하트 아이콘
- `Icons.Star` - 별 아이콘
- `Icons.Share` - 공유 아이콘

### Arrows
- `Icons.ArrowUp` - 위쪽 화살표
- `Icons.ArrowDown` - 아래쪽 화살표
- `Icons.ArrowLeft` - 왼쪽 화살표
- `Icons.ArrowRight` - 오른쪽 화살표

### Moonwave 특화
- `Icons.Wave` - 파도 아이콘
- `Icons.Moon` - 달 아이콘
- `Icons.Sun` - 태양 아이콘

## 사용 예시

### 버튼과 함께 사용

```tsx
<button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
  <Icons.Plus size={20} />
  <span>추가</span>
</button>
```

### 다양한 크기

```tsx
<div className="flex items-center space-x-4">
  <Icons.Star size={16} className="text-yellow-500" />
  <Icons.Star size={24} className="text-yellow-500" />
  <Icons.Star size={32} className="text-yellow-500" />
  <Icons.Star size={48} className="text-yellow-500" />
</div>
```

### Solid vs Outline

```tsx
<div className="flex items-center space-x-4">
  <HeroIcon name="HeartIcon" size={32} className="text-red-500" variant="outline" />
  <HeroIcon name="HeartIcon" size={32} className="text-red-500" variant="solid" />
</div>
```

## 새로운 아이콘 추가하기

새로운 아이콘을 추가하려면 `components/ui/heroicons.tsx` 파일의 `Icons` 객체에 추가하면 됩니다:

```tsx
export const Icons = {
  // 기존 아이콘들...
  
  // 새로운 아이콘 추가
  NewIcon: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="NewIconName" {...props} />,
};
```

## 테스트

Heroicons 테스트 컴포넌트를 확인하려면:

```tsx
import HeroiconsTest from './components/HeroiconsTest';

// App.tsx나 원하는 컴포넌트에서 사용
<HeroiconsTest />
```

## 참고 자료

- [Heroicons 공식 사이트](https://heroicons.com/)
- [Heroicons React 패키지](https://www.npmjs.com/package/@heroicons/react)
- [Heroicons 아이콘 목록](https://heroicons.com/icons) 