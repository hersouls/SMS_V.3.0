// Firebase 마이그레이션 스크립트
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// .env 파일 로드
dotenv.config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🚀 Firebase 마이그레이션 시작\n');

// 마이그레이션 함수
async function migrateData() {
  try {
    // 1. 기본 카테고리 생성
    console.log('📁 기본 카테고리 생성 중...');
    const defaultCategories = [
      { name: '엔터테인먼트', color: '#FF6B6B', icon: '🎬', description: '영화, 음악, 게임 등' },
      { name: '생산성', color: '#4ECDC4', icon: '💼', description: '업무 및 생산성 도구' },
      { name: '교육', color: '#45B7D1', icon: '📚', description: '온라인 강의 및 학습' },
      { name: '클라우드', color: '#96CEB4', icon: '☁️', description: '클라우드 스토리지 및 서비스' },
      { name: '소프트웨어', color: '#FECA57', icon: '💻', description: '소프트웨어 및 앱' },
      { name: '뉴스', color: '#48DBFB', icon: '📰', description: '뉴스 및 정보' },
      { name: '기타', color: '#A0A0A0', icon: '📦', description: '기타 서비스' }
    ];

    for (const category of defaultCategories) {
      const categoryRef = doc(collection(db, 'default_categories'));
      await setDoc(categoryRef, {
        ...category,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`  ✅ ${category.name} 카테고리 생성됨`);
    }

    // 2. 샘플 데이터 확인
    const migrationDataPath = join(process.cwd(), 'scripts', 'migration-data.json');
    
    if (existsSync(migrationDataPath)) {
      console.log('\n📊 기존 데이터 마이그레이션 중...');
      const migrationData = JSON.parse(readFileSync(migrationDataPath, 'utf-8'));
      
      // 사용자별 데이터 마이그레이션
      for (const userId in migrationData.users) {
        const userData = migrationData.users[userId];
        console.log(`\n👤 사용자 ${userData.email} 데이터 마이그레이션:`);
        
        // 구독 데이터 마이그레이션
        if (userData.subscriptions) {
          for (const subscription of userData.subscriptions) {
            const subscriptionRef = doc(collection(db, 'subscriptions'));
            await setDoc(subscriptionRef, {
              ...subscription,
              userId,
              createdAt: new Date(subscription.createdAt || Date.now()),
              updatedAt: new Date(subscription.updatedAt || Date.now()),
              startDate: new Date(subscription.startDate)
            });
            console.log(`  ✅ ${subscription.serviceName} 구독 마이그레이션됨`);
          }
        }
        
        // 사용자 설정 마이그레이션
        if (userData.preferences) {
          const preferencesRef = doc(db, 'preferences', userId);
          await setDoc(preferencesRef, {
            ...userData.preferences,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`  ✅ 사용자 설정 마이그레이션됨`);
        }
      }
    } else {
      console.log('\n⚠️  마이그레이션 데이터 파일이 없습니다. 샘플 데이터를 생성합니다.');
      
      // 샘플 데이터 생성
      console.log('\n📝 샘플 구독 데이터 생성 중...');
      const sampleSubscriptions = [
        {
          serviceName: 'Netflix',
          logo: '🎬',
          amount: 17000,
          currency: 'KRW',
          paymentCycle: 'monthly',
          paymentDay: 15,
          startDate: new Date('2024-01-15'),
          autoRenewal: true,
          status: 'active',
          category: '엔터테인먼트',
          tags: ['스트리밍', '영화', 'TV'],
          notifications: {
            sevenDays: true,
            threeDays: true,
            sameDay: true
          }
        },
        {
          serviceName: 'Spotify',
          logo: '🎵',
          amount: 10900,
          currency: 'KRW',
          paymentCycle: 'monthly',
          paymentDay: 1,
          startDate: new Date('2024-02-01'),
          autoRenewal: true,
          status: 'active',
          category: '엔터테인먼트',
          tags: ['음악', '스트리밍'],
          notifications: {
            sevenDays: true,
            threeDays: false,
            sameDay: true
          }
        },
        {
          serviceName: 'ChatGPT Plus',
          logo: '🤖',
          amount: 20,
          currency: 'USD',
          paymentCycle: 'monthly',
          paymentDay: 10,
          startDate: new Date('2024-03-10'),
          autoRenewal: true,
          status: 'active',
          category: '생산성',
          tags: ['AI', '업무도구'],
          notifications: {
            sevenDays: true,
            threeDays: true,
            sameDay: true
          }
        }
      ];

      // 현재 로그인한 사용자 확인
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        console.log(`\n👤 현재 사용자 (${auth.currentUser.email})에 샘플 데이터 추가:`);
        
        for (const subscription of sampleSubscriptions) {
          const subscriptionRef = doc(collection(db, 'subscriptions'));
          await setDoc(subscriptionRef, {
            ...subscription,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`  ✅ ${subscription.serviceName} 추가됨`);
        }
      } else {
        console.log('\n⚠️  로그인된 사용자가 없습니다. 샘플 데이터를 추가하려면 먼저 로그인하세요.');
      }
    }

    // 3. Firestore 인덱스 생성 안내
    console.log('\n📌 Firestore 복합 인덱스 생성 안내:');
    console.log('Firebase Console > Firestore Database > 인덱스에서 다음 인덱스를 생성하세요:');
    console.log('1. subscriptions: userId (오름차순) + createdAt (내림차순)');
    console.log('2. subscriptions: userId (오름차순) + status (오름차순) + paymentDay (오름차순)');
    console.log('3. notifications: userId (오름차순) + createdAt (내림차순)');
    console.log('4. categories: userId (오름차순) + name (오름차순)');

    console.log('\n✅ Firebase 마이그레이션 완료!');
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행
async function main() {
  try {
    // 관리자 계정으로 로그인 시도 (선택사항)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      console.log('🔐 관리자 계정으로 로그인 중...');
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ 로그인 성공\n');
    }
    
    await migrateData();
    
    console.log('\n🎉 모든 작업이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main();