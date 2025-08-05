import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 샘플 통계 리포트 데이터
const sampleStatisticsReports = [
  {
    reportId: 'monthly_2024_12',
    reportType: 'monthly',
    period: {
      year: 2024,
      month: 12,
      startDate: '2024-12-01',
      endDate: '2024-12-31'
    },
    summary: {
      totalSpend: 156000,
      averageSpend: 19500,
      activeSubscriptions: 8,
      topCategory: '엔터테인먼트',
      topCategorySpend: 64000,
      growthRate: 12.5
    },
    trends: {
      spendingTrend: 'increasing',
      subscriptionGrowth: 15.2,
      categoryDistribution: {
        '엔터테인먼트': 64000,
        '생산성': 42000,
        '음악': 28000,
        '클라우드': 12000,
        '교육': 10000
      }
    },
    insights: [
      '이번 달 구독 지출이 전월 대비 12.5% 증가했습니다.',
      '엔터테인먼트 카테고리가 전체 지출의 41%를 차지합니다.',
      '새로운 구독 서비스 3개가 추가되었습니다.',
      '월 평균 구독료가 19,500원으로 적정 수준입니다.'
    ],
    monthlyBreakdown: [
      { category: '엔터테인먼트', amount: 64000, count: 3, percentage: 41.0 },
      { category: '생산성', amount: 42000, count: 2, percentage: 26.9 },
      { category: '음악', amount: 28000, count: 2, percentage: 17.9 },
      { category: '클라우드', amount: 12000, count: 2, percentage: 7.7 },
      { category: '교육', amount: 10000, count: 1, percentage: 6.4 }
    ],
    recommendations: [
      {
        type: 'cost_optimization',
        title: '비용 최적화',
        description: 'Apple Music과 Spotify를 동시에 사용하고 있습니다. 하나로 통합하면 월 10,900원을 절약할 수 있습니다.',
        potentialSaving: 10900
      },
      {
        type: 'usage_review',
        title: '사용량 검토',
        description: 'Disney+ 구독을 3개월간 사용하지 않았습니다. 일시정지를 고려해보세요.',
        potentialSaving: 9990
      }
    ],
    metadata: {
      generatedAt: serverTimestamp(),
      version: '1.0',
      dataPoints: 156,
      accuracy: 95.5
    }
  },
  {
    reportId: 'yearly_2024',
    reportType: 'yearly',
    period: {
      year: 2024,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    summary: {
      totalSpend: 1650000,
      averageSpend: 137500,
      activeSubscriptions: 12,
      topCategory: '엔터테인먼트',
      topCategorySpend: 680000,
      growthRate: 8.3
    },
    trends: {
      spendingTrend: 'increasing',
      subscriptionGrowth: 25.0,
      categoryDistribution: {
        '엔터테인먼트': 680000,
        '생산성': 420000,
        '음악': 320000,
        '클라우드': 144000,
        '교육': 86000
      }
    },
    insights: [
      '2024년 총 구독 지출이 165만원으로 전년 대비 8.3% 증가했습니다.',
      '엔터테인먼트 서비스에 가장 많은 비용을 지출했습니다.',
      '연간 구독으로 전환하여 약 8만원을 절약했습니다.',
      '새로운 AI 도구 구독이 생산성 향상에 기여했습니다.'
    ],
    monthlyTrends: [
      { month: 1, amount: 135000, growth: 0 },
      { month: 2, amount: 138000, growth: 2.2 },
      { month: 3, amount: 142000, growth: 2.9 },
      { month: 4, amount: 145000, growth: 2.1 },
      { month: 5, amount: 140000, growth: -3.4 },
      { month: 6, amount: 138000, growth: -1.4 },
      { month: 7, amount: 135000, growth: -2.2 },
      { month: 8, amount: 138000, growth: 2.2 },
      { month: 9, amount: 142000, growth: 2.9 },
      { month: 10, amount: 148000, growth: 4.2 },
      { month: 11, amount: 153000, growth: 3.4 },
      { month: 12, amount: 156000, growth: 2.0 }
    ],
    recommendations: [
      {
        type: 'annual_savings',
        title: '연간 구독 전환',
        description: 'Microsoft 365를 연간 구독으로 전환하면 연간 2만원을 절약할 수 있습니다.',
        potentialSaving: 20000
      },
      {
        type: 'category_balance',
        title: '카테고리 균형',
        description: '엔터테인먼트 비중이 높습니다. 교육/생산성 도구 비중을 늘려보세요.',
        potentialSaving: 0
      }
    ],
    metadata: {
      generatedAt: serverTimestamp(),
      version: '1.0',
      dataPoints: 1850,
      accuracy: 98.2
    }
  }
];

async function updateStatisticsSchema() {
  try {
    // 사용자 인증
    console.log('🔐 사용자 인증 중...');
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      process.env.VITE_TEST_USER_EMAIL, 
      process.env.VITE_TEST_USER_PASSWORD
    );
    const user = userCredential.user;
    console.log('✅ 인증 성공:', user.email);

    console.log('\n📊 통계 리포트 데이터 생성 중...');
    
    // 각 통계 리포트 생성
    for (const report of sampleStatisticsReports) {
      try {
        const reportData = {
          ...report,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // statisticsReports 컬렉션에 추가
        await addDoc(collection(db, 'statisticsReports'), reportData);
        console.log(`✅ ${report.reportId} 리포트 생성 완료`);
      } catch (error) {
        console.error(`❌ ${report.reportId} 리포트 생성 실패:`, error.message);
      }
    }

    // 사용자별 통계 설정 생성
    console.log('\n⚙️ 통계 설정 생성 중...');
    const statisticsConfig = {
      userId: user.uid,
      defaultReportType: 'monthly',
      autoGenerate: true,
      generateSchedule: {
        monthly: true,
        quarterly: true,
        yearly: true
      },
      notificationSettings: {
        reportReady: true,
        insights: true,
        recommendations: true
      },
      preferences: {
        currency: 'KRW',
        includeInactive: false,
        detailLevel: 'detailed'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'statisticsConfigs', user.uid), statisticsConfig);
    console.log('✅ 통계 설정 생성 완료');

    console.log('\n🎉 Firebase 통계 스키마 업데이트가 완료되었습니다!');
    console.log('📋 생성된 컬렉션:');
    console.log('  - statisticsReports: 통계 리포트 데이터');
    console.log('  - statisticsConfigs: 사용자별 통계 설정');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

console.log('📊 Moonwave 통계 스키마 업데이트');
console.log('================================\n');

updateStatisticsSchema();