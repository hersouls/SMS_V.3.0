// Firebase 통계 리포트 데이터베이스 업데이트 스크립트
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDHR3xBJI4J9aYFPj9Q3XY6GF-kFhvgJLI",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "sms-v3.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "sms-v3",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "sms-v3.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdefghijklmnop"
};

// Firebase 초기화
console.log('🚀 Firebase 초기화 중...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateFirebaseStatistics() {
  try {
    console.log('📊 Firebase 통계 리포트 기능 업데이트 시작...');

    // 1. 샘플 통계 설정 생성
    console.log('⚙️ 통계 설정 생성 중...');
    
    const sampleUserId = 'demo_user_123'; // 테스트용 사용자 ID
    
    const statisticsConfig = {
      userId: sampleUserId,
      defaultReportType: 'monthly',
      autoGenerate: true,
      generateSchedule: {
        monthly: true,
        quarterly: false,
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

    await setDoc(doc(db, 'statisticsConfigs', sampleUserId), statisticsConfig);
    console.log('✅ 통계 설정 생성 완료');

    // 2. 샘플 통계 리포트 생성
    console.log('📋 샘플 통계 리포트 생성 중...');
    
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    const sampleReports = [
      {
        userId: sampleUserId,
        reportType: 'monthly',
        title: `월간 구독 리포트 - ${lastMonth.getFullYear()}년 ${lastMonth.getMonth() + 1}월`,
        period: {
          start: lastMonth.toISOString(),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString()
        },
        summary: {
          totalSpend: 89500,
          averageSpend: 12786,
          activeSubscriptions: 7,
          newSubscriptions: 2,
          cancelledSubscriptions: 1,
          topCategory: '엔터테인먼트',
          topCategorySpend: 34000,
          growthRate: 8.5
        },
        insights: [
          '이번 달 총 지출이 지난달 대비 8.5% 증가했습니다.',
          '엔터테인먼트 카테고리가 전체 지출의 38%를 차지합니다.',
          '새로운 구독 2개가 추가되어 다양성이 증가했습니다.',
          '평균 구독 비용이 적정 수준을 유지하고 있습니다.'
        ],
        recommendations: [
          '엔터테인먼트 구독이 많으니 중복되는 서비스가 있는지 확인해보세요.',
          '분기별 구독 검토를 통해 불필요한 서비스를 정리하는 것을 권장합니다.',
          '가격 인상이 예정된 서비스는 대안을 미리 찾아보세요.'
        ],
        categoryBreakdown: {
          '엔터테인먼트': { amount: 34000, count: 3, percentage: 38 },
          '생산성': { amount: 25500, count: 2, percentage: 28.5 },
          '음악': { amount: 20000, count: 1, percentage: 22.3 },
          '클라우드': { amount: 10000, count: 1, percentage: 11.2 }
        },
        trends: {
          spendingTrend: 'increasing',
          subscriptionGrowth: 2,
          categoryDistribution: {
            '엔터테인먼트': 34000,
            '생산성': 25500,
            '음악': 20000,
            '클라우드': 10000
          }
        },
        metadata: {
          generatedBy: 'system',
          dataVersion: '1.0',
          includesInactive: false,
          exchangeRate: 1300
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        userId: sampleUserId,
        reportType: 'yearly',
        title: `연간 구독 리포트 - ${currentDate.getFullYear()}년`,
        period: {
          start: new Date(currentDate.getFullYear(), 0, 1).toISOString(),
          end: new Date(currentDate.getFullYear(), 11, 31).toISOString()
        },
        summary: {
          totalSpend: 1074000,
          averageSpend: 13425,
          activeSubscriptions: 8,
          newSubscriptions: 5,
          cancelledSubscriptions: 2,
          topCategory: '엔터테인먼트',
          topCategorySpend: 408000,
          growthRate: 15.2
        },
        insights: [
          '올해 총 구독 지출이 107만원으로 작년 대비 15.2% 증가했습니다.',
          '엔터테인먼트 카테고리가 연간 지출의 38%를 차지합니다.',
          '월평균 구독 비용이 89,500원으로 적정 수준입니다.',
          '구독 서비스 다양성이 증가하여 더 나은 서비스를 이용하고 있습니다.'
        ],
        recommendations: [
          '내년에는 구독 예산을 110만원 정도로 설정하는 것을 권장합니다.',
          '분기별 구독 리뷰를 통해 효율성을 높이세요.',
          '연말 할인 혜택을 활용하여 연간 결제로 전환을 고려해보세요.'
        ],
        categoryBreakdown: {
          '엔터테인먼트': { amount: 408000, count: 36, percentage: 38 },
          '생산성': { amount: 306000, count: 24, percentage: 28.5 },
          '음악': { amount: 240000, count: 12, percentage: 22.3 },
          '클라우드': { amount: 120000, count: 12, percentage: 11.2 }
        },
        trends: {
          spendingTrend: 'increasing',
          subscriptionGrowth: 5,
          categoryDistribution: {
            '엔터테인먼트': 408000,
            '생산성': 306000,
            '음악': 240000,
            '클라우드': 120000
          }
        },
        metadata: {
          generatedBy: 'system',
          dataVersion: '1.0',
          includesInactive: false,
          exchangeRate: 1300
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // 통계 리포트 저장
    for (const report of sampleReports) {
      const docRef = await addDoc(collection(db, 'statisticsReports'), report);
      console.log(`✅ ${report.reportType} 리포트 생성됨: ${docRef.id}`);
    }

    // 3. 통계 데이터 컬렉션 생성 (실시간 통계용)
    console.log('📈 실시간 통계 데이터 생성 중...');
    
    const realtimeStats = {
      userId: sampleUserId,
      data: {
        totalSubscriptions: 8,
        activeSubscriptions: 7,
        pausedSubscriptions: 1,
        cancelledSubscriptions: 0,
        totalMonthlyKrw: 89500,
        avgSubscriptionCost: 12786,
        upcomingPayments: 3,
        todayCount: 0,
        weekCount: 1,
        categoryBreakdown: {
          '엔터테인먼트': 3,
          '생산성': 2,
          '음악': 1,
          '클라우드': 1,
          '피트니스': 1
        },
        currencyBreakdown: {
          'KRW': 6,
          'USD': 2
        },
        paymentCycleBreakdown: {
          'monthly': 6,
          'yearly': 2
        }
      },
      timestamp: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    await setDoc(doc(db, 'statistics', sampleUserId), realtimeStats);
    console.log('✅ 실시간 통계 데이터 생성 완료');

    // 4. 통계 템플릿 생성 (리포트 생성용)
    console.log('📝 통계 템플릿 생성 중...');
    
    const reportTemplates = [
      {
        id: 'monthly_basic',
        name: '월간 기본 리포트',
        type: 'monthly',
        sections: ['summary', 'categoryBreakdown', 'insights', 'recommendations'],
        format: 'detailed',
        enabled: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'yearly_comprehensive',
        name: '연간 종합 리포트',
        type: 'yearly',
        sections: ['summary', 'categoryBreakdown', 'trends', 'insights', 'recommendations', 'forecast'],
        format: 'comprehensive',
        enabled: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'quarterly_review',
        name: '분기별 검토 리포트',
        type: 'quarterly',
        sections: ['summary', 'trends', 'recommendations'],
        format: 'summary',
        enabled: false,
        createdAt: serverTimestamp()
      }
    ];

    for (const template of reportTemplates) {
      await setDoc(doc(db, 'reportTemplates', template.id), template);
      console.log(`✅ 리포트 템플릿 생성됨: ${template.name}`);
    }

    console.log('\n🎉 Firebase 통계 리포트 기능 업데이트 완료!');
    console.log('\n📊 생성된 컬렉션:');
    console.log('  - statisticsConfigs (통계 설정)');
    console.log('  - statisticsReports (통계 리포트)');
    console.log('  - statistics (실시간 통계)');
    console.log('  - reportTemplates (리포트 템플릿)');

    // 5. 생성된 데이터 확인
    console.log('\n🔍 생성된 데이터 확인 중...');
    
    const configsSnapshot = await getDocs(collection(db, 'statisticsConfigs'));
    console.log(`✅ 통계 설정: ${configsSnapshot.size}개`);
    
    const reportsSnapshot = await getDocs(collection(db, 'statisticsReports'));
    console.log(`✅ 통계 리포트: ${reportsSnapshot.size}개`);
    
    const statsSnapshot = await getDocs(collection(db, 'statistics'));
    console.log(`✅ 실시간 통계: ${statsSnapshot.size}개`);
    
    const templatesSnapshot = await getDocs(collection(db, 'reportTemplates'));
    console.log(`✅ 리포트 템플릿: ${templatesSnapshot.size}개`);

  } catch (error) {
    console.error('❌ Firebase 업데이트 실패:', error);
    throw error;
  }
}

// 스크립트 실행
updateFirebaseStatistics()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });