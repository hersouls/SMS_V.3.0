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
  deleteDoc
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

// Sample subscription data
const sampleSubscriptions = [
  // 엔터테인먼트
  {
    serviceName: 'Netflix',
    serviceUrl: 'https://www.netflix.com',
    logo: '🎬',
    amount: 17000,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 15,
    paymentMethod: '신한카드',
    startDate: '2023-01-15',
    autoRenewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: '프리미엄',
    tags: ['스트리밍', '영화', '드라마'],
    memo: '가족 계정 공유 중',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: false
    }
  },
  {
    serviceName: 'YouTube Premium',
    serviceUrl: 'https://www.youtube.com/premium',
    logo: '📺',
    amount: 14900,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 5,
    paymentMethod: '카카오페이',
    startDate: '2023-03-05',
    autoRenewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: '가족',
    tags: ['스트리밍', '음악', '광고제거'],
    memo: '광고 없이 영상 시청',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: true
    }
  },
  {
    serviceName: 'Disney+',
    serviceUrl: 'https://www.disneyplus.com',
    logo: '🏰',
    amount: 9.99,
    currency: 'USD',
    paymentCycle: 'monthly',
    paymentDay: 20,
    paymentMethod: '삼성카드',
    startDate: '2023-06-20',
    autoRenewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: '스탠다드',
    tags: ['스트리밍', '디즈니', '마블'],
    notifications: {
      sevenDays: false,
      threeDays: true,
      sameDay: true
    }
  },
  
  // 생산성
  {
    serviceName: 'Microsoft 365',
    serviceUrl: 'https://www.microsoft.com/microsoft-365',
    logo: '💼',
    amount: 89900,
    currency: 'KRW',
    paymentCycle: 'yearly',
    paymentDay: 10,
    paymentMethod: '우리카드',
    startDate: '2023-02-10',
    autoRenewal: true,
    status: 'active',
    category: '생산성',
    tier: '개인용',
    tags: ['오피스', '클라우드', '업무'],
    memo: '1TB 클라우드 저장소 포함',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    }
  },
  {
    serviceName: 'Notion',
    serviceUrl: 'https://www.notion.so',
    logo: '📝',
    amount: 8,
    currency: 'USD',
    paymentCycle: 'monthly',
    paymentDay: 25,
    paymentMethod: '토스',
    startDate: '2023-04-25',
    autoRenewal: true,
    status: 'active',
    category: '생산성',
    tier: '개인 프로',
    tags: ['노트', '협업', '데이터베이스'],
    memo: '개인 지식 관리용',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    }
  },
  
  // 음악
  {
    serviceName: 'Spotify',
    serviceUrl: 'https://www.spotify.com',
    logo: '🎵',
    amount: 11900,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 8,
    paymentMethod: '네이버페이',
    startDate: '2023-01-08',
    autoRenewal: true,
    status: 'active',
    category: '음악',
    tier: '프리미엄',
    tags: ['음악', '스트리밍', '팟캐스트'],
    memo: '운동할 때 필수',
    notifications: {
      sevenDays: false,
      threeDays: true,
      sameDay: false
    }
  },
  {
    serviceName: 'Apple Music',
    serviceUrl: 'https://music.apple.com',
    logo: '🎶',
    amount: 10900,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 12,
    paymentMethod: 'KB카드',
    startDate: '2023-05-12',
    autoRenewal: false,
    status: 'paused',
    category: '음악',
    tier: '개인',
    tags: ['음악', '애플', 'K-POP'],
    memo: 'Spotify로 전환 예정',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    }
  },
  
  // 클라우드 저장소
  {
    serviceName: 'Google One',
    serviceUrl: 'https://one.google.com',
    logo: '☁️',
    amount: 2400,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 1,
    paymentMethod: '하나카드',
    startDate: '2022-12-01',
    autoRenewal: true,
    status: 'active',
    category: '클라우드',
    tier: '100GB',
    tags: ['저장소', '백업', '구글'],
    memo: '사진 백업용',
    notifications: {
      sevenDays: true,
      threeDays: false,
      sameDay: false
    }
  },
  {
    serviceName: 'iCloud+',
    serviceUrl: 'https://www.icloud.com',
    logo: '🍎',
    amount: 1100,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 17,
    paymentMethod: '농협카드',
    startDate: '2023-03-17',
    autoRenewal: true,
    status: 'active',
    category: '클라우드',
    tier: '50GB',
    tags: ['저장소', '애플', '동기화'],
    memo: 'iPhone 백업',
    notifications: {
      sevenDays: false,
      threeDays: false,
      sameDay: true
    }
  },
  
  // 교육
  {
    serviceName: 'Coursera Plus',
    serviceUrl: 'https://www.coursera.org',
    logo: '🎓',
    amount: 59,
    currency: 'USD',
    paymentCycle: 'yearly',
    paymentDay: 30,
    paymentMethod: '신한카드',
    startDate: '2023-01-30',
    autoRenewal: false,
    status: 'active',
    category: '교육',
    tier: '연간 무제한',
    tags: ['온라인강의', '자격증', 'IT'],
    memo: 'Google 자격증 과정 수강 중',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    }
  },
  
  // 뉴스
  {
    serviceName: '한국경제신문',
    serviceUrl: 'https://www.hankyung.com',
    logo: '📰',
    amount: 15000,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 1,
    paymentMethod: '카카오뱅크',
    startDate: '2023-07-01',
    autoRenewal: true,
    status: 'active',
    category: '뉴스',
    tier: '디지털 구독',
    tags: ['경제', '뉴스', '투자'],
    memo: '투자 정보 확인',
    notifications: {
      sevenDays: false,
      threeDays: true,
      sameDay: false
    }
  },
  
  // 건강/피트니스
  {
    serviceName: '헬스장 멤버십',
    serviceUrl: '',
    logo: '💪',
    amount: 89000,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 5,
    paymentMethod: '현금',
    startDate: '2023-04-05',
    autoRenewal: false,
    status: 'active',
    category: '건강',
    tier: '일반',
    tags: ['운동', '헬스', '피트니스'],
    memo: '주 3회 이상 방문 목표',
    notifications: {
      sevenDays: true,
      threeDays: true,
      sameDay: true
    }
  },
  
  // 게임
  {
    serviceName: 'Xbox Game Pass',
    serviceUrl: 'https://www.xbox.com/game-pass',
    logo: '🎮',
    amount: 16900,
    currency: 'KRW',
    paymentCycle: 'monthly',
    paymentDay: 22,
    paymentMethod: '우리카드',
    startDate: '2023-02-22',
    autoRenewal: true,
    status: 'cancelled',
    endDate: '2023-12-22',
    category: '게임',
    tier: 'Ultimate',
    tags: ['게임', 'PC', 'Xbox'],
    memo: 'PlayStation으로 전환',
    notifications: {
      sevenDays: false,
      threeDays: false,
      sameDay: false
    }
  }
];

// Sample notifications
const sampleNotifications = [
  {
    type: 'payment',
    title: 'Netflix 결제 예정',
    message: '3일 후 Netflix 정기 결제가 예정되어 있습니다. (17,000원)',
    isRead: false,
    priority: 'high',
    category: '엔터테인먼트'
  },
  {
    type: 'renewal',
    title: 'Microsoft 365 갱신 알림',
    message: 'Microsoft 365 연간 구독이 다음 주에 자동 갱신됩니다.',
    isRead: false,
    priority: 'medium',
    category: '생산성'
  },
  {
    type: 'expiry',
    title: 'Coursera Plus 만료 예정',
    message: 'Coursera Plus 구독이 30일 후 만료됩니다. 갱신하시겠습니까?',
    isRead: true,
    priority: 'medium',
    category: '교육'
  },
  {
    type: 'system',
    title: '새로운 기능 안내',
    message: '이제 구독 서비스별 사용 통계를 확인할 수 있습니다!',
    isRead: true,
    priority: 'low'
  }
];

async function clearExistingData(userId) {
  console.log('🧹 기존 데이터 삭제 중...');
  
  try {
    // Clear subscriptions
    const subscriptionsQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId));
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    for (const doc of subscriptionsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`✅ ${subscriptionsSnapshot.size}개의 구독 삭제 완료`);
    
    // Clear notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    for (const doc of notificationsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`✅ ${notificationsSnapshot.size}개의 알림 삭제 완료`);
    
  } catch (error) {
    console.error('❌ 데이터 삭제 중 오류:', error);
  }
}

async function generateSampleData() {
  try {
    // 환경 변수 확인
    if (!process.env.VITE_TEST_USER_EMAIL || !process.env.VITE_TEST_USER_PASSWORD) {
      console.error('❌ 테스트 계정 정보가 .env 파일에 없습니다.');
      console.log('다음 환경 변수를 설정해주세요:');
      console.log('VITE_TEST_USER_EMAIL=your-test-email@example.com');
      console.log('VITE_TEST_USER_PASSWORD=your-test-password');
      process.exit(1);
    }

    // 사용자 인증
    console.log('🔐 사용자 인증 중...');
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      process.env.VITE_TEST_USER_EMAIL, 
      process.env.VITE_TEST_USER_PASSWORD
    );
    const user = userCredential.user;
    console.log('✅ 인증 성공:', user.email);

    // 기존 데이터 삭제 옵션
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      await clearExistingData(user.uid);
    }

    // 구독 데이터 생성
    console.log('\n📝 구독 데이터 생성 중...');
    let successCount = 0;
    
    for (const subscription of sampleSubscriptions) {
      try {
        const docData = {
          ...subscription,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'subscriptions'), docData);
        console.log(`✅ ${subscription.serviceName} 추가 완료`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${subscription.serviceName} 추가 실패:`, error.message);
      }
    }
    
    console.log(`\n✅ 구독 데이터 생성 완료: ${successCount}/${sampleSubscriptions.length}`);

    // 알림 데이터 생성
    console.log('\n🔔 알림 데이터 생성 중...');
    let notificationCount = 0;
    
    for (const notification of sampleNotifications) {
      try {
        const docData = {
          ...notification,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'notifications'), docData);
        console.log(`✅ "${notification.title}" 알림 추가 완료`);
        notificationCount++;
      } catch (error) {
        console.error(`❌ "${notification.title}" 알림 추가 실패:`, error.message);
      }
    }
    
    console.log(`\n✅ 알림 데이터 생성 완료: ${notificationCount}/${sampleNotifications.length}`);

    // 사용자 설정 생성/업데이트
    console.log('\n⚙️ 사용자 설정 생성 중...');
    const userPreferences = {
      userId: user.uid,
      exchangeRate: 1350,
      defaultCurrency: 'KRW',
      notifications: {
        paymentReminders: true,
        priceChanges: true,
        subscriptionExpiry: true,
        email: true,
        push: false,
        sms: false
      },
      theme: 'dark',
      language: 'ko',
      timezone: 'Asia/Seoul',
      dateFormat: 'YYYY-MM-DD',
      currencyFormat: 'KRW',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'preferences', user.uid), userPreferences);
    console.log('✅ 사용자 설정 생성 완료');

    console.log('\n🎉 모든 샘플 데이터 생성이 완료되었습니다!');
    console.log('Moonwave 앱에서 확인해보세요.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
console.log('🌊 Moonwave 샘플 데이터 생성기');
console.log('================================');
console.log('사용법: node generate-sample-data.js [--clear]');
console.log('--clear 옵션: 기존 데이터를 모두 삭제하고 새로 생성\n');

generateSampleData();