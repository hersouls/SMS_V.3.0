import { 
  SubscriptionStatistics, 
  CategoryAnalytics, 
  PaymentCycleAnalytics, 
  TagAnalytics, 
  MonthlySpendingTrends, 
  NotificationAnalytics, 
  UserBehaviorAnalytics 
} from './statistics';

// =====================================================
// 가상 사용자 ID
// =====================================================
export const MOCK_USER_ID = 'mock-user-123';

// =====================================================
// 가상 구독 데이터
// =====================================================
export const MOCK_SUBSCRIPTIONS = [
  // 엔터테인먼트 카테고리
  {
    id: 'sub-1',
    user_id: MOCK_USER_ID,
    service_name: 'Netflix',
    service_url: 'https://netflix.com',
    logo: 'N',
    logo_image: 'https://via.placeholder.com/64x64/ff0000/ffffff?text=N',
    amount: 17000,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: '신한카드',
    start_date: '2024-01-15',
    auto_renewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: 'Standard',
    tags: ['스트리밍', '영화', '드라마'],
    memo: '월 4개 디바이스 지원',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'sub-2',
    user_id: MOCK_USER_ID,
    service_name: 'Disney+',
    service_url: 'https://disneyplus.com',
    logo: 'D',
    logo_image: 'https://via.placeholder.com/64x64/113ccf/ffffff?text=D',
    amount: 14000,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 22,
    payment_method: '현대카드',
    start_date: '2024-01-22',
    auto_renewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: 'Standard',
    tags: ['스트리밍', '영화', '애니메이션'],
    memo: '마블, 스타워즈 콘텐츠',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-22T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z'
  },
  {
    id: 'sub-3',
    user_id: MOCK_USER_ID,
    service_name: 'Apple TV+',
    service_url: 'https://tv.apple.com',
    logo: 'A',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=A',
    amount: 6500,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 28,
    payment_method: 'Apple Pay',
    start_date: '2024-02-28',
    auto_renewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: 'Basic',
    tags: ['스트리밍', '오리지널', '애플'],
    memo: 'Apple One 패키지 포함',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-28T00:00:00Z',
    updated_at: '2024-02-28T00:00:00Z'
  },
  {
    id: 'sub-4',
    user_id: MOCK_USER_ID,
    service_name: 'YouTube Premium',
    service_url: 'https://youtube.com',
    logo: 'Y',
    logo_image: 'https://via.placeholder.com/64x64/ff0000/ffffff?text=Y',
    amount: 14900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 10,
    payment_method: '구글페이',
    start_date: '2024-03-10',
    auto_renewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: 'Premium',
    tags: ['스트리밍', '광고제거', '백그라운드'],
    memo: '광고 없는 YouTube 시청',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    },
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'sub-5',
    user_id: MOCK_USER_ID,
    service_name: 'Amazon Prime Video',
    service_url: 'https://primevideo.com',
    logo: 'A',
    logo_image: 'https://via.placeholder.com/64x64/00a8e1/ffffff?text=A',
    amount: 4900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 5,
    payment_method: 'Amazon Pay',
    start_date: '2024-01-05',
    auto_renewal: true,
    status: 'paused',
    category: '엔터테인먼트',
    tier: 'Basic',
    tags: ['스트리밍', '프라임', '배송'],
    memo: '일시정지 - 여행 중',
    notifications: {
      sevenDays: false,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-06-05T00:00:00Z'
  },
  // 음악 카테고리
  {
    id: 'sub-6',
    user_id: MOCK_USER_ID,
    service_name: 'Spotify',
    service_url: 'https://spotify.com',
    logo: 'S',
    logo_image: 'https://via.placeholder.com/64x64/1db954/ffffff?text=S',
    amount: 13900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 20,
    payment_method: '삼성카드',
    start_date: '2024-02-20',
    auto_renewal: true,
    status: 'active',
    category: '음악',
    tier: 'Premium',
    tags: ['음악', '스트리밍', '오프라인'],
    memo: '광고 없는 음악 스트리밍',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    },
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z'
  },
  {
    id: 'sub-7',
    user_id: MOCK_USER_ID,
    service_name: 'Apple Music',
    service_url: 'https://music.apple.com',
    logo: 'A',
    logo_image: 'https://via.placeholder.com/64x64/fb2d3f/ffffff?text=A',
    amount: 11000,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'Apple Pay',
    start_date: '2024-01-15',
    auto_renewal: true,
    status: 'active',
    category: '음악',
    tier: 'Individual',
    tags: ['음악', '애플', '스페이스오디오'],
    memo: '스페이스 오디오 지원',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'sub-8',
    user_id: MOCK_USER_ID,
    service_name: 'YouTube Music',
    service_url: 'https://music.youtube.com',
    logo: 'Y',
    logo_image: 'https://via.placeholder.com/64x64/ff0000/ffffff?text=Y',
    amount: 14900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 10,
    payment_method: '구글페이',
    start_date: '2024-03-10',
    auto_renewal: true,
    status: 'active',
    category: '음악',
    tier: 'Premium',
    tags: ['음악', '유튜브', '백그라운드'],
    memo: 'YouTube Premium과 함께',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    },
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'sub-9',
    user_id: MOCK_USER_ID,
    service_name: 'Tidal',
    service_url: 'https://tidal.com',
    logo: 'T',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=T',
    amount: 19900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-02-25',
    auto_renewal: true,
    status: 'cancelled',
    category: '음악',
    tier: 'HiFi',
    tags: ['음악', '고음질', '마스터'],
    memo: '고음질 스트리밍 서비스',
    notifications: {
      sevenDays: false,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-05-25T00:00:00Z'
  },
  // 개발 도구 카테고리
  {
    id: 'sub-10',
    user_id: MOCK_USER_ID,
    service_name: 'GitHub Pro',
    service_url: 'https://github.com',
    logo: 'G',
    logo_image: 'https://via.placeholder.com/64x64/24292e/ffffff?text=G',
    amount: 4,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 1,
    payment_method: 'PayPal',
    start_date: '2024-03-01',
    auto_renewal: true,
    status: 'active',
    category: '개발',
    tier: 'Pro',
    tags: ['개발', '코딩', '버전관리'],
    memo: '프라이빗 저장소 무제한',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: 'sub-11',
    user_id: MOCK_USER_ID,
    service_name: 'Vercel Pro',
    service_url: 'https://vercel.com',
    logo: 'V',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=V',
    amount: 20,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'PayPal',
    start_date: '2024-02-15',
    auto_renewal: true,
    status: 'active',
    category: '개발',
    tier: 'Pro',
    tags: ['개발', '배포', '호스팅'],
    memo: 'Next.js 최적화 배포',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'sub-12',
    user_id: MOCK_USER_ID,
    service_name: 'JetBrains All Products',
    service_url: 'https://jetbrains.com',
    logo: 'J',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=J',
    amount: 199,
    currency: 'USD',
    payment_cycle: 'yearly',
    payment_day: 1,
    payment_method: 'PayPal',
    start_date: '2024-01-01',
    auto_renewal: true,
    status: 'active',
    category: '개발',
    tier: 'All Products',
    tags: ['개발', 'IDE', '도구'],
    memo: 'IntelliJ, PyCharm, WebStorm 포함',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sub-13',
    user_id: MOCK_USER_ID,
    service_name: 'VS Code Pro',
    service_url: 'https://code.visualstudio.com',
    logo: 'V',
    logo_image: 'https://via.placeholder.com/64x64/007acc/ffffff?text=V',
    amount: 5,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 20,
    payment_method: 'PayPal',
    start_date: '2024-03-20',
    auto_renewal: true,
    status: 'active',
    category: '개발',
    tier: 'Pro',
    tags: ['개발', '에디터', '확장'],
    memo: '고급 기능 및 확장 지원',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z'
  },
  {
    id: 'sub-14',
    user_id: MOCK_USER_ID,
    service_name: 'Figma Dev Mode',
    service_url: 'https://figma.com',
    logo: 'F',
    logo_image: 'https://via.placeholder.com/64x64/f24e1e/ffffff?text=F',
    amount: 8,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-02-25',
    auto_renewal: true,
    status: 'active',
    category: '개발',
    tier: 'Dev Mode',
    tags: ['개발', '디자인', '협업'],
    memo: '개발자용 Figma 기능',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-02-25T00:00:00Z'
  },
  // AI 서비스 카테고리
  {
    id: 'sub-15',
    user_id: MOCK_USER_ID,
    service_name: 'ChatGPT Plus',
    service_url: 'https://chat.openai.com',
    logo: 'C',
    logo_image: 'https://via.placeholder.com/64x64/10a37f/ffffff?text=C',
    amount: 20,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 10,
    payment_method: 'PayPal',
    start_date: '2024-01-10',
    auto_renewal: true,
    status: 'active',
    category: 'AI',
    tier: 'Plus',
    tags: ['AI', '챗봇', '생산성'],
    memo: 'GPT-4 모델 사용 가능',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'sub-16',
    user_id: MOCK_USER_ID,
    service_name: 'Claude Pro',
    service_url: 'https://claude.ai',
    logo: 'C',
    logo_image: 'https://via.placeholder.com/64x64/5436da/ffffff?text=C',
    amount: 20,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'PayPal',
    start_date: '2024-02-15',
    auto_renewal: true,
    status: 'active',
    category: 'AI',
    tier: 'Pro',
    tags: ['AI', '챗봇', '분석'],
    memo: 'Anthropic의 고급 AI 모델',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'sub-17',
    user_id: MOCK_USER_ID,
    service_name: 'Midjourney',
    service_url: 'https://midjourney.com',
    logo: 'M',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=M',
    amount: 10,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 5,
    payment_method: 'PayPal',
    start_date: '2024-03-05',
    auto_renewal: true,
    status: 'active',
    category: 'AI',
    tier: 'Basic',
    tags: ['AI', '이미지생성', '아트'],
    memo: 'AI 이미지 생성 서비스',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: 'sub-18',
    user_id: MOCK_USER_ID,
    service_name: 'Notion AI',
    service_url: 'https://notion.so',
    logo: 'N',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=N',
    amount: 8,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 5,
    payment_method: 'PayPal',
    start_date: '2024-01-05',
    auto_renewal: true,
    status: 'active',
    category: 'AI',
    tier: 'AI Add-on',
    tags: ['AI', '생산성', '노트'],
    memo: 'Notion에 AI 기능 추가',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'sub-19',
    user_id: MOCK_USER_ID,
    service_name: 'Grammarly Premium',
    service_url: 'https://grammarly.com',
    logo: 'G',
    logo_image: 'https://via.placeholder.com/64x64/15c39a/ffffff?text=G',
    amount: 12,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 20,
    payment_method: 'PayPal',
    start_date: '2024-02-20',
    auto_renewal: true,
    status: 'active',
    category: 'AI',
    tier: 'Premium',
    tags: ['AI', '문법검사', '작문'],
    memo: 'AI 기반 문법 검사 및 개선',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z'
  },
  // 디자인 도구 카테고리
  {
    id: 'sub-20',
    user_id: MOCK_USER_ID,
    service_name: 'Figma',
    service_url: 'https://figma.com',
    logo: 'F',
    logo_image: 'https://via.placeholder.com/64x64/f24e1e/ffffff?text=F',
    amount: 12,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-02-25',
    auto_renewal: true,
    status: 'active',
    category: '디자인',
    tier: 'Professional',
    tags: ['디자인', 'UI/UX', '협업'],
    memo: '팀 협업 기능 포함',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-02-25T00:00:00Z'
  },
  {
    id: 'sub-21',
    user_id: MOCK_USER_ID,
    service_name: 'Adobe Creative Cloud',
    service_url: 'https://adobe.com',
    logo: 'A',
    logo_image: 'https://via.placeholder.com/64x64/ff0000/ffffff?text=A',
    amount: 52.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 8,
    payment_method: 'PayPal',
    start_date: '2024-01-08',
    auto_renewal: true,
    status: 'active',
    category: '디자인',
    tier: 'All Apps',
    tags: ['디자인', '편집', '크리에이티브'],
    memo: 'Photoshop, Illustrator, Premiere Pro 포함',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  },
  {
    id: 'sub-22',
    user_id: MOCK_USER_ID,
    service_name: 'Sketch',
    service_url: 'https://sketch.com',
    logo: 'S',
    logo_image: 'https://via.placeholder.com/64x64/fd6a02/ffffff?text=S',
    amount: 9,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'PayPal',
    start_date: '2024-03-15',
    auto_renewal: true,
    status: 'active',
    category: '디자인',
    tier: 'Standard',
    tags: ['디자인', 'UI/UX', '맥전용'],
    memo: 'macOS 전용 디자인 도구',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: 'sub-23',
    user_id: MOCK_USER_ID,
    service_name: 'Canva Pro',
    service_url: 'https://canva.com',
    logo: 'C',
    logo_image: 'https://via.placeholder.com/64x64/00c4cc/ffffff?text=C',
    amount: 12.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 10,
    payment_method: 'PayPal',
    start_date: '2024-02-10',
    auto_renewal: true,
    status: 'active',
    category: '디자인',
    tier: 'Pro',
    tags: ['디자인', '템플릿', '웹기반'],
    memo: '프로 템플릿 및 브랜드킷',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z'
  },
  // 생산성 도구 카테고리
  {
    id: 'sub-24',
    user_id: MOCK_USER_ID,
    service_name: 'Notion',
    service_url: 'https://notion.so',
    logo: 'N',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=N',
    amount: 8,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 5,
    payment_method: 'PayPal',
    start_date: '2024-01-05',
    auto_renewal: true,
    status: 'active',
    category: '생산성',
    tier: 'Personal Pro',
    tags: ['생산성', '노트', '관리'],
    memo: '무제한 블록 및 파일 업로드',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'sub-25',
    user_id: MOCK_USER_ID,
    service_name: 'Slack',
    service_url: 'https://slack.com',
    logo: 'S',
    logo_image: 'https://via.placeholder.com/64x64/4a154b/ffffff?text=S',
    amount: 7.25,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 20,
    payment_method: 'PayPal',
    start_date: '2024-02-20',
    auto_renewal: true,
    status: 'active',
    category: '생산성',
    tier: 'Pro',
    tags: ['생산성', '커뮤니케이션', '협업'],
    memo: '팀 커뮤니케이션 플랫폼',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z'
  },
  {
    id: 'sub-26',
    user_id: MOCK_USER_ID,
    service_name: 'Trello',
    service_url: 'https://trello.com',
    logo: 'T',
    logo_image: 'https://via.placeholder.com/64x64/0079bf/ffffff?text=T',
    amount: 5,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'PayPal',
    start_date: '2024-03-15',
    auto_renewal: true,
    status: 'active',
    category: '생산성',
    tier: 'Standard',
    tags: ['생산성', '프로젝트관리', '칸반'],
    memo: '프로젝트 관리 및 협업',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: 'sub-27',
    user_id: MOCK_USER_ID,
    service_name: 'Asana',
    service_url: 'https://asana.com',
    logo: 'A',
    logo_image: 'https://via.placeholder.com/64x64/f06a6a/ffffff?text=A',
    amount: 10.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-01-25',
    auto_renewal: true,
    status: 'active',
    category: '생산성',
    tier: 'Premium',
    tags: ['생산성', '프로젝트관리', '워크플로우'],
    memo: '고급 프로젝트 관리 기능',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  // 교육 카테고리
  {
    id: 'sub-28',
    user_id: MOCK_USER_ID,
    service_name: 'Coursera Plus',
    service_url: 'https://coursera.org',
    logo: 'C',
    logo_image: 'https://via.placeholder.com/64x64/0056d2/ffffff?text=C',
    amount: 49,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 12,
    payment_method: 'PayPal',
    start_date: '2024-03-12',
    auto_renewal: true,
    status: 'active',
    category: '교육',
    tier: 'Plus',
    tags: ['교육', '온라인', '강의'],
    memo: '7000개 이상의 강의 무제한 수강',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-03-12T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z'
  },
  {
    id: 'sub-29',
    user_id: MOCK_USER_ID,
    service_name: 'Udemy',
    service_url: 'https://udemy.com',
    logo: 'U',
    logo_image: 'https://via.placeholder.com/64x64/ea5252/ffffff?text=U',
    amount: 16.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 18,
    payment_method: 'PayPal',
    start_date: '2024-02-18',
    auto_renewal: true,
    status: 'active',
    category: '교육',
    tier: 'Personal',
    tags: ['교육', '온라인', '기술'],
    memo: '개발 및 디자인 강의',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-18T00:00:00Z',
    updated_at: '2024-02-18T00:00:00Z'
  },
  {
    id: 'sub-30',
    user_id: MOCK_USER_ID,
    service_name: 'Skillshare',
    service_url: 'https://skillshare.com',
    logo: 'S',
    logo_image: 'https://via.placeholder.com/64x64/ff6b6b/ffffff?text=S',
    amount: 32,
    currency: 'USD',
    payment_cycle: 'yearly',
    payment_day: 1,
    payment_method: 'PayPal',
    start_date: '2024-01-01',
    auto_renewal: true,
    status: 'active',
    category: '교육',
    tier: 'Premium',
    tags: ['교육', '크리에이티브', '기술'],
    memo: '연간 구독으로 할인',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // 피트니스 카테고리
  {
    id: 'sub-31',
    user_id: MOCK_USER_ID,
    service_name: 'MyFitnessPal',
    service_url: 'https://myfitnesspal.com',
    logo: 'M',
    logo_image: 'https://via.placeholder.com/64x64/00a1e4/ffffff?text=M',
    amount: 9.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 18,
    payment_method: 'PayPal',
    start_date: '2024-02-18',
    auto_renewal: true,
    status: 'active',
    category: '피트니스',
    tier: 'Premium',
    tags: ['피트니스', '건강', '다이어트'],
    memo: '고급 영양 분석 및 운동 추적',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-02-18T00:00:00Z',
    updated_at: '2024-02-18T00:00:00Z'
  },
  {
    id: 'sub-32',
    user_id: MOCK_USER_ID,
    service_name: 'Strava',
    service_url: 'https://strava.com',
    logo: 'S',
    logo_image: 'https://via.placeholder.com/64x64/fc4c02/ffffff?text=S',
    amount: 5.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-01-25',
    auto_renewal: true,
    status: 'active',
    category: '피트니스',
    tier: 'Premium',
    tags: ['피트니스', '운동', '러닝'],
    memo: '고급 운동 분석 및 경로 추적',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  {
    id: 'sub-33',
    user_id: MOCK_USER_ID,
    service_name: 'Peloton',
    service_url: 'https://peloton.com',
    logo: 'P',
    logo_image: 'https://via.placeholder.com/64x64/000000/ffffff?text=P',
    amount: 12.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 10,
    payment_method: 'PayPal',
    start_date: '2024-03-10',
    auto_renewal: true,
    status: 'active',
    category: '피트니스',
    tier: 'Digital',
    tags: ['피트니스', '홈트레이닝', '라이브'],
    memo: '홈 피트니스 클래스',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  // 게임 카테고리
  {
    id: 'sub-34',
    user_id: MOCK_USER_ID,
    service_name: 'Xbox Game Pass',
    service_url: 'https://xbox.com',
    logo: 'X',
    logo_image: 'https://via.placeholder.com/64x64/107c10/ffffff?text=X',
    amount: 14.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: 'PayPal',
    start_date: '2024-02-15',
    auto_renewal: true,
    status: 'active',
    category: '게임',
    tier: 'Ultimate',
    tags: ['게임', '콘솔', '클라우드'],
    memo: 'Xbox 및 PC 게임 라이브러리',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    },
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'sub-35',
    user_id: MOCK_USER_ID,
    service_name: 'PlayStation Plus',
    service_url: 'https://playstation.com',
    logo: 'P',
    logo_image: 'https://via.placeholder.com/64x64/003791/ffffff?text=P',
    amount: 9.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 20,
    payment_method: 'PayPal',
    start_date: '2024-01-20',
    auto_renewal: true,
    status: 'active',
    category: '게임',
    tier: 'Essential',
    tags: ['게임', '콘솔', '멀티플레이어'],
    memo: '온라인 멀티플레이어 및 월 게임',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'sub-36',
    user_id: MOCK_USER_ID,
    service_name: 'Nintendo Switch Online',
    service_url: 'https://nintendo.com',
    logo: 'N',
    logo_image: 'https://via.placeholder.com/64x64/e60012/ffffff?text=N',
    amount: 3.99,
    currency: 'USD',
    payment_cycle: 'monthly',
    payment_day: 25,
    payment_method: 'PayPal',
    start_date: '2024-03-25',
    auto_renewal: true,
    status: 'active',
    category: '게임',
    tier: 'Individual',
    tags: ['게임', '콘솔', '레트로'],
    memo: '온라인 플레이 및 클래식 게임',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    },
    created_at: '2024-03-25T00:00:00Z',
    updated_at: '2024-03-25T00:00:00Z'
  }
];

// =====================================================
// 가상 통계 데이터 생성 함수들
// =====================================================

export function generateMockSubscriptionStatistics(): SubscriptionStatistics[] {
  return MOCK_SUBSCRIPTIONS.map((sub, index) => {
    const monthlyAmountKrw = sub.currency === 'USD' ? sub.amount * 1300 : sub.amount;
    const yearlyAmountKrw = sub.payment_cycle === 'yearly' ? monthlyAmountKrw : monthlyAmountKrw * 12;
    
    return {
      id: `stat-${sub.id}`,
      user_id: MOCK_USER_ID,
      subscription_id: sub.id,
      date: new Date().toISOString().split('T')[0]!,
      monthly_amount_krw: monthlyAmountKrw,
      yearly_amount_krw: yearlyAmountKrw,
      total_paid_krw: monthlyAmountKrw * (index + 1), // 가상 누적 지출
      category: sub.category,
      category_rank: Math.floor(Math.random() * 5) + 1,
      category_percentage: Math.random() * 100,
      payment_cycle: sub.payment_cycle,
      cycle_rank: Math.floor(Math.random() * 3) + 1,
      cycle_percentage: Math.random() * 100,
      status: sub.status,
      days_active: Math.floor(Math.random() * 365) + 1,
      days_paused: sub.status === 'paused' ? Math.floor(Math.random() * 30) : 0,
      currency: sub.currency,
      exchange_rate: 1300,
      tags_count: sub.tags.length,
      popular_tags: sub.tags,
      notification_types: sub.notifications,
      metadata: {
        service_name: sub.service_name,
        payment_method: sub.payment_method,
        auto_renewal: sub.auto_renewal
      }
    };
  });
}

export function generateMockCategoryAnalytics(): CategoryAnalytics[] {
  const categories = ['엔터테인먼트', '음악', '개발', 'AI', '디자인', '생산성', '교육', '피트니스', '게임'];
  
  return categories.map((category, index) => {
    const subscriptionCount = MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category).length;
    const activeCount = MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.status === 'active').length;
    const totalMonthlyKrw = MOCK_SUBSCRIPTIONS
      .filter(sub => sub.category === category)
      .reduce((sum, sub) => {
        const amount = sub.currency === 'USD' ? sub.amount * 1300 : sub.amount;
        return sum + amount;
      }, 0);
    
    return {
      id: `cat-${index}`,
      user_id: MOCK_USER_ID,
      category,
      date: new Date().toISOString().split('T')[0]!,
      subscription_count: subscriptionCount,
      active_count: activeCount,
      paused_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.status === 'paused').length,
      cancelled_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.status === 'cancelled').length,
      total_monthly_krw: totalMonthlyKrw,
      total_yearly_krw: totalMonthlyKrw * 12,
      average_monthly_krw: subscriptionCount > 0 ? totalMonthlyKrw / subscriptionCount : 0,
      max_monthly_krw: Math.max(...MOCK_SUBSCRIPTIONS
        .filter(sub => sub.category === category)
        .map(sub => sub.currency === 'USD' ? sub.amount * 1300 : sub.amount), 0),
      min_monthly_krw: Math.min(...MOCK_SUBSCRIPTIONS
        .filter(sub => sub.category === category)
        .map(sub => sub.currency === 'USD' ? sub.amount * 1300 : sub.amount), 0),
      monthly_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.payment_cycle === 'monthly').length,
      yearly_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.payment_cycle === 'yearly').length,
      onetime_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.payment_cycle === 'onetime').length,
      krw_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.currency === 'KRW').length,
      usd_count: MOCK_SUBSCRIPTIONS.filter(sub => sub.category === category && sub.currency === 'USD').length,
      growth_rate: Math.random() * 20 - 10, // -10% ~ +10%
      previous_month_amount: totalMonthlyKrw * 0.95,
      metadata: {
        category_description: `${category} 카테고리 분석 데이터`
      }
    };
  });
}

export function generateMockPaymentCycleAnalytics(): PaymentCycleAnalytics[] {
  const cycles = ['monthly', 'yearly', 'onetime'];
  
  return cycles.map((cycle, index) => {
    const subscriptionCount = MOCK_SUBSCRIPTIONS.filter(sub => sub.payment_cycle === cycle).length;
    const activeCount = MOCK_SUBSCRIPTIONS.filter(sub => sub.payment_cycle === cycle && sub.status === 'active').length;
    const totalMonthlyKrw = MOCK_SUBSCRIPTIONS
      .filter(sub => sub.payment_cycle === cycle)
      .reduce((sum, sub) => {
        const amount = sub.currency === 'USD' ? sub.amount * 1300 : sub.amount;
        return sum + amount;
      }, 0);
    
    const categoryBreakdown = MOCK_SUBSCRIPTIONS
      .filter(sub => sub.payment_cycle === cycle)
      .reduce((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const currencyBreakdown = MOCK_SUBSCRIPTIONS
      .filter(sub => sub.payment_cycle === cycle)
      .reduce((acc, sub) => {
        acc[sub.currency] = (acc[sub.currency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      id: `cycle-${index}`,
      user_id: MOCK_USER_ID,
      payment_cycle: cycle,
      date: new Date().toISOString().split('T')[0]!,
      subscription_count: subscriptionCount,
      active_count: activeCount,
      total_monthly_krw: totalMonthlyKrw,
      total_yearly_krw: totalMonthlyKrw * 12,
      average_amount_krw: subscriptionCount > 0 ? totalMonthlyKrw / subscriptionCount : 0,
      category_breakdown: categoryBreakdown,
      currency_breakdown: currencyBreakdown,
      growth_rate: Math.random() * 15 - 5, // -5% ~ +10%
      previous_month_count: Math.max(0, subscriptionCount - Math.floor(Math.random() * 2)),
      metadata: {
        cycle_description: `${cycle} 결제주기 분석 데이터`
      }
    };
  });
}

export function generateMockTagAnalytics(): TagAnalytics[] {
  const allTags = new Set<string>();
  MOCK_SUBSCRIPTIONS.forEach(sub => {
    sub.tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).map((tag, index) => {
    const taggedSubs = MOCK_SUBSCRIPTIONS.filter(sub => sub.tags.includes(tag));
    const activeCount = taggedSubs.filter(s => s.status === 'active').length;
    const totalMonthlyKrw = taggedSubs.reduce((sum, sub) => {
      const amount = sub.currency === 'USD' ? sub.amount * 1300 : sub.amount;
      return sum + amount;
    }, 0);
    
    const categoryBreakdown = taggedSubs.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const cycleBreakdown = taggedSubs.reduce((acc, sub) => {
      acc[sub.payment_cycle] = (acc[sub.payment_cycle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularityScore = taggedSubs.length * 10 + totalMonthlyKrw / 1000;
    
    return {
      id: `tag-${index}`,
      user_id: MOCK_USER_ID,
      tag_name: tag,
      date: new Date().toISOString().split('T')[0]!,
      subscription_count: taggedSubs.length,
      active_count: activeCount,
      total_monthly_krw: totalMonthlyKrw,
      average_amount_krw: taggedSubs.length > 0 ? totalMonthlyKrw / taggedSubs.length : 0,
      category_breakdown: categoryBreakdown,
      cycle_breakdown: cycleBreakdown,
      popularity_rank: index + 1,
      popularity_score: popularityScore,
      metadata: {
        tag_description: `${tag} 태그 분석 데이터`
      }
    };
  });
}

export function generateMockMonthlySpendingTrends(): MonthlySpendingTrends[] {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 현실적인 월별 지출 패턴 (시작은 낮고 점진적으로 증가)
  const monthlyPatterns = [
    80000,   // 1월 - 연초, 낮은 지출
    95000,   // 2월 - 점진적 증가
    120000,  // 3월 - 봄 시작, 증가
    135000,  // 4월 - 안정적 증가
    150000,  // 5월 - 중간 수준
    165000,  // 6월 - 여름 시작
    180000,  // 7월 - 여름 휴가 시즌
    195000,  // 8월 - 여름 피크
    185000,  // 9월 - 가을 시작, 약간 감소
    170000,  // 10월 - 안정화
    160000,  // 11월 - 연말 준비
    145000   // 12월 - 연말 정리
  ];
  
  return months.map((month, index) => {
    const baseAmount = monthlyPatterns[index] || 50000; // Default base amount if undefined
    const variation = Math.random() * 20000 - 10000; // ±10,000원 변동
    const totalSpendKrw = Math.max(baseAmount + variation, 50000);
    
    // 현실적인 구독 수 변화
    const baseSubscriptions = 25; // 총 36개 구독 중
    const activeSubscriptions = Math.max(20, Math.min(30, baseSubscriptions + Math.floor(Math.random() * 10) - 5));
    const newSubscriptions = Math.floor(Math.random() * 4); // 0-3개
    const cancelledSubscriptions = Math.floor(Math.random() * 2); // 0-1개
    const pausedSubscriptions = Math.floor(Math.random() * 3); // 0-2개
    
    // 카테고리별 지출 분포 (실제 구독 데이터 기반)
    const categorySpending = {
      '엔터테인먼트': totalSpendKrw * 0.35, // Netflix, Disney+, Apple TV+, YouTube Premium, Amazon Prime
      '음악': totalSpendKrw * 0.12, // Spotify, Apple Music, YouTube Music, Tidal
      '개발': totalSpendKrw * 0.18, // GitHub, Vercel, JetBrains, VS Code, Figma Dev
      'AI': totalSpendKrw * 0.10, // ChatGPT, Claude, Midjourney, Notion AI, Grammarly
      '디자인': totalSpendKrw * 0.08, // Figma, Adobe, Sketch, Canva
      '생산성': totalSpendKrw * 0.07, // Notion, Slack, Trello, Asana
      '교육': totalSpendKrw * 0.05, // Coursera, Udemy, Skillshare
      '피트니스': totalSpendKrw * 0.03, // MyFitnessPal, Strava, Peloton
      '게임': totalSpendKrw * 0.02  // Xbox, PlayStation, Nintendo
    };
    
    const cycleSpending = {
      'monthly': totalSpendKrw * 0.75, // 대부분 월간 구독
      'yearly': totalSpendKrw * 0.20, // 일부 연간 구독 (JetBrains, Skillshare)
      'onetime': totalSpendKrw * 0.05  // 일회성 구독
    };
    
    const currencySpending = {
      'KRW': totalSpendKrw * 0.45, // 국내 서비스들
      'USD': totalSpendKrw * 0.55  // 해외 서비스들
    };
    
    // 트렌드 방향 결정 (실제 패턴 기반)
    let trendDirection: 'increasing' | 'decreasing' | 'stable';
    if (index < 6) {
      trendDirection = 'increasing'; // 상반기 증가
    } else if (index < 9) {
      trendDirection = 'stable'; // 하반기 안정
    } else {
      trendDirection = 'decreasing'; // 연말 감소
    }
    
    return {
      id: `trend-${month}`,
      user_id: MOCK_USER_ID,
      year: currentYear,
      month,
      total_spend_krw: totalSpendKrw,
      active_subscriptions: activeSubscriptions,
      new_subscriptions: newSubscriptions,
      cancelled_subscriptions: cancelledSubscriptions,
      paused_subscriptions: pausedSubscriptions,
      category_spending: categorySpending,
      cycle_spending: cycleSpending,
      currency_spending: currencySpending,
      month_over_month_change: index > 0 && monthlyPatterns[index - 1] ? ((totalSpendKrw - monthlyPatterns[index - 1]!) / monthlyPatterns[index - 1]!) * 100 : 0,
      year_over_year_change: Math.random() * 15 - 5, // -5% ~ +10%
      predicted_next_month: totalSpendKrw * (1 + (Math.random() * 0.1 - 0.05)), // ±5% 예측
      trend_direction: trendDirection,
      metadata: {
        exchange_rate: 1300,
        calculation_date: new Date().toISOString(),
        seasonal_factor: index >= 6 && index <= 8 ? 'summer_peak' : index >= 11 || index <= 1 ? 'year_end' : 'normal'
      }
    };
  });
}

export function generateMockNotificationAnalytics(): NotificationAnalytics {
  const activeSubscriptions = MOCK_SUBSCRIPTIONS.filter(sub => sub.status === 'active');
  const totalSubscriptions = activeSubscriptions.length;
  
  // 실제 알림 설정 기반 통계
  const sevenDaysEnabled = activeSubscriptions.filter(sub => sub.notifications?.sevenDays).length;
  const threeDaysEnabled = activeSubscriptions.filter(sub => sub.notifications?.threeDays).length;
  const sameDayEnabled = activeSubscriptions.filter(sub => sub.notifications?.sameDay).length;
  
  // 현실적인 알림 통계 (월간 기준)
  const notificationsSent = Math.floor(Math.random() * 40) + 30; // 30-70개
  const notificationsRead = Math.floor(notificationsSent * (0.6 + Math.random() * 0.3)); // 60-90% 읽음
  const notificationsClicked = Math.floor(notificationsRead * (0.2 + Math.random() * 0.4)); // 20-60% 클릭
  
  const responseRate = notificationsSent > 0 ? (notificationsRead / notificationsSent) * 100 : 0;
  const engagementScore = notificationsSent > 0 ? (notificationsClicked / notificationsSent) * 100 : 0;
  
  // 알림 타입별 분포
  const paymentReminders = Math.floor(notificationsSent * 0.65); // 결제 알림이 가장 많음
  const renewalNotifications = Math.floor(notificationsSent * 0.20); // 갱신 알림
  const expiryWarnings = Math.floor(notificationsSent * 0.15); // 만료 경고
  
  return {
    id: 'notification-analytics-1',
    user_id: MOCK_USER_ID,
    date: new Date().toISOString().split('T')[0]!,
    total_subscriptions: totalSubscriptions,
    seven_days_enabled: sevenDaysEnabled,
    three_days_enabled: threeDaysEnabled,
    same_day_enabled: sameDayEnabled,
    notifications_sent: notificationsSent,
    notifications_read: notificationsRead,
    notifications_clicked: notificationsClicked,
    payment_reminders: paymentReminders,
    renewal_notifications: renewalNotifications,
    expiry_warnings: expiryWarnings,
    response_rate: responseRate,
    engagement_score: engagementScore,
    metadata: {
      total_notifications: notificationsSent,
      read_rate: responseRate,
      engagement_rate: engagementScore,
      notification_preferences: {
        seven_days_ratio: sevenDaysEnabled / totalSubscriptions,
        three_days_ratio: threeDaysEnabled / totalSubscriptions,
        same_day_ratio: sameDayEnabled / totalSubscriptions
      },
      effectiveness_score: responseRate > 80 ? 'excellent' : responseRate > 60 ? 'good' : 'needs_improvement'
    }
  };
}

export function generateMockUserBehaviorAnalytics(): UserBehaviorAnalytics {
  // 현실적인 사용자 행동 패턴
  const loginCount = Math.floor(Math.random() * 25) + 15; // 15-40회
  const subscriptionViews = Math.floor(Math.random() * 40) + 30; // 30-70회
  const subscriptionEdits = Math.floor(Math.random() * 8) + 3; // 3-11회
  const subscriptionAdds = Math.floor(Math.random() * 4) + 1; // 1-5회
  const subscriptionDeletes = Math.floor(Math.random() * 2) + 0; // 0-2회
  const dashboardViews = Math.floor(Math.random() * 35) + 20; // 20-55회
  const calendarViews = Math.floor(Math.random() * 15) + 10; // 10-25회
  const settingsViews = Math.floor(Math.random() * 8) + 2; // 2-10회
  const notificationViews = Math.floor(Math.random() * 12) + 8; // 8-20회
  const sessionDurationMinutes = Math.floor(Math.random() * 90) + 45; // 45-135분
  const pageViews = Math.floor(Math.random() * 80) + 60; // 60-140회
  const uniquePagesVisited = Math.floor(Math.random() * 15) + 10; // 10-25개
  
  // 실제 구독 데이터 기반 선호도
  const preferredCategories = ['엔터테인먼트', '개발', 'AI', '음악', '디자인'];
  const preferredPaymentCycles = ['monthly', 'yearly'];
  const preferredCurrencies = ['USD', 'KRW']; // 해외 서비스가 많아서 USD가 우선
  
  // 만족도 점수 계산 (더 현실적인 공식)
  const satisfactionScore = Math.min(5, Math.max(1, 
    (loginCount / 20) + // 로그인 빈도
    (subscriptionViews / 50) + // 구독 관리 활동
    (sessionDurationMinutes / 120) + // 세션 시간
    (subscriptionEdits / 10) + // 구독 편집 활동
    (subscriptionAdds / 5) // 새 구독 추가
  ));
  
  // 참여도 점수 계산 (더 세밀한 공식)
  const engagementScore = Math.min(100, 
    (pageViews * 1.5) + // 페이지 뷰
    (uniquePagesVisited * 3) + // 다양한 페이지 방문
    (subscriptionEdits * 8) + // 구독 편집
    (subscriptionAdds * 12) + // 새 구독 추가
    (dashboardViews * 2) + // 대시보드 활용
    (calendarViews * 3) + // 캘린더 활용
    (sessionDurationMinutes / 2) // 세션 시간
  );
  
  return {
    id: 'behavior-analytics-1',
    user_id: MOCK_USER_ID,
    date: new Date().toISOString().split('T')[0]!,
    login_count: loginCount,
    subscription_views: subscriptionViews,
    subscription_edits: subscriptionEdits,
    subscription_adds: subscriptionAdds,
    subscription_deletes: subscriptionDeletes,
    dashboard_views: dashboardViews,
    calendar_views: calendarViews,
    settings_views: settingsViews,
    notification_views: notificationViews,
    session_duration_minutes: sessionDurationMinutes,
    page_views: pageViews,
    unique_pages_visited: uniquePagesVisited,
    preferred_categories: preferredCategories,
    preferred_payment_cycles: preferredPaymentCycles,
    preferred_currencies: preferredCurrencies,
    satisfaction_score: satisfactionScore,
    engagement_score: engagementScore,
    metadata: {
      collection_timestamp: new Date().toISOString(),
      data_source: 'user_behavior_tracking',
      user_type: engagementScore > 80 ? 'power_user' : engagementScore > 50 ? 'active_user' : 'casual_user',
      activity_pattern: loginCount > 30 ? 'daily_user' : loginCount > 15 ? 'weekly_user' : 'monthly_user'
    }
  };
}

// =====================================================
// 통합 모의 데이터 생성 함수
// =====================================================

export function generateAllMockData() {
  return {
    subscriptions: MOCK_SUBSCRIPTIONS,
    subscriptionStatistics: generateMockSubscriptionStatistics(),
    categoryAnalytics: generateMockCategoryAnalytics(),
    paymentCycleAnalytics: generateMockPaymentCycleAnalytics(),
    tagAnalytics: generateMockTagAnalytics(),
    monthlySpendingTrends: generateMockMonthlySpendingTrends(),
    notificationAnalytics: generateMockNotificationAnalytics(),
    userBehaviorAnalytics: generateMockUserBehaviorAnalytics()
  };
}

// =====================================================
// 모의 데이터 저장 함수 (로컬 스토리지)
// =====================================================

export function saveMockDataToLocalStorage() {
  const mockData = generateAllMockData();
  
  // 로컬 스토리지에 저장
  Object.entries(mockData).forEach(([key, data]) => {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  });
  
  console.log('모의 데이터가 로컬 스토리지에 저장되었습니다.');
  return mockData;
}

export function loadMockDataFromLocalStorage() {
  const mockData: any = {};
  
  // 로컬 스토리지에서 로드
  const keys = [
    'subscriptions',
    'subscriptionStatistics', 
    'categoryAnalytics',
    'paymentCycleAnalytics',
    'tagAnalytics',
    'monthlySpendingTrends',
    'notificationAnalytics',
    'userBehaviorAnalytics'
  ];
  
  keys.forEach(key => {
    const data = localStorage.getItem(`mock_${key}`);
    if (data) {
      mockData[key] = JSON.parse(data);
    }
  });
  
  return mockData;
}

// =====================================================
// 모의 데이터 초기화
// =====================================================

export function initializeMockData() {
  // 로컬 스토리지에 모의 데이터 저장
  saveMockDataToLocalStorage();
  
  console.log('모의 데이터 초기화 완료');
  console.log('생성된 데이터:', generateAllMockData());
} 