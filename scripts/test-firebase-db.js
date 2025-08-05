import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBk1uQIH5pgz4nLjqZMqUVlwHlLa0LHhNw",
  authDomain: "sms-v3.firebaseapp.com",
  projectId: "sms-v3",
  storageBucket: "sms-v3.firebasestorage.app",
  messagingSenderId: "278884646788",
  appId: "1:278884646788:web:9f534ea0468581b16867d1",
  measurementId: "G-SKHLBRGJWS"
};

async function testFirebaseDB() {
  try {
    console.log('🔥 Firebase DB 테스트 시작...');
    
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase 초기화 완료');
    
    // 테스트 데이터 생성
    const testSubscription = {
      userId: 'test-user-' + Date.now(),
      serviceName: '테스트 서비스',
      serviceUrl: 'https://test.com',
      amount: 9900,
      currency: 'KRW',
      paymentCycle: 'monthly',
      paymentDay: 15,
      autoRenewal: true,
      status: 'active',
      category: '테스트',
      notifications: {
        sevenDays: true,
        threeDays: true,
        sameDay: true
      },
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 테스트 데이터 생성:', testSubscription);
    
    // 구독 데이터 저장
    const docRef = await addDoc(collection(db, 'subscriptions'), testSubscription);
    console.log('✅ 데이터 저장 완료 - 문서 ID:', docRef.id);
    
    // 저장된 데이터 확인 (단순 쿼리)
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', testSubscription.userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('📊 저장된 데이터 확인:');
    
    querySnapshot.forEach((doc) => {
      console.log('  - 문서 ID:', doc.id);
      console.log('  - 서비스명:', doc.data().serviceName);
      console.log('  - 금액:', doc.data().amount);
      console.log('  - 상태:', doc.data().status);
      console.log('  - 생성일:', doc.data().createdAt.toDate());
    });
    
    console.log('🎉 Firebase DB 테스트 완료!');
    console.log(`총 ${querySnapshot.size}개의 문서가 저장되어 있습니다.`);
    
  } catch (error) {
    console.error('❌ Firebase DB 테스트 실패:', error);
  }
}

// 스크립트 실행
testFirebaseDB(); 