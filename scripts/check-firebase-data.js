import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkFirebaseData() {
  try {
    console.log('🔍 Firebase DB 데이터 확인 시작...');
    
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase 초기화 완료');
    
    // 구독 데이터 확인
    console.log('📊 구독 데이터 확인 중...');
    const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
    
    console.log(`📈 총 구독 수: ${subscriptionsSnapshot.size}개`);
    
    if (subscriptionsSnapshot.size > 0) {
      console.log('\n📋 저장된 구독 목록:');
      subscriptionsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. 문서 ID: ${doc.id}`);
        console.log(`   서비스명: ${data.serviceName}`);
        console.log(`   사용자 ID: ${data.userId}`);
        console.log(`   금액: ${data.amount} ${data.currency}`);
        console.log(`   상태: ${data.status}`);
        console.log(`   생성일: ${data.createdAt?.toDate?.() || data.createdAt}`);
      });
    } else {
      console.log('❌ 저장된 구독이 없습니다.');
    }
    
    // 알림 데이터 확인
    console.log('\n📊 알림 데이터 확인 중...');
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    console.log(`📈 총 알림 수: ${notificationsSnapshot.size}개`);
    
    // 사용자 설정 데이터 확인
    console.log('\n📊 사용자 설정 데이터 확인 중...');
    const userPreferencesSnapshot = await getDocs(collection(db, 'userPreferences'));
    console.log(`📈 총 사용자 설정 수: ${userPreferencesSnapshot.size}개`);
    
    console.log('\n🎉 Firebase DB 데이터 확인 완료!');
    
  } catch (error) {
    console.error('❌ Firebase DB 데이터 확인 실패:', error);
  }
}

// 스크립트 실행
checkFirebaseData(); 