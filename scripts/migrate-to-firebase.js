#!/usr/bin/env node

/**
 * Supabase에서 Firebase로 데이터 마이그레이션 스크립트
 * 
 * 사용법:
 * node scripts/migrate-to-firebase.js
 */

const { createClient } = require('@supabase/supabase-js');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
require('dotenv').config();

// Supabase 클라이언트 설정
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 데이터 변환 유틸리티
const convertSupabaseToFirebase = (data, userId) => {
  const converted = { ...data };
  
  // user_id를 userId로 변환
  if (converted.user_id) {
    converted.userId = converted.user_id;
    delete converted.user_id;
  }
  
  // subscription_id를 subscriptionId로 변환
  if (converted.subscription_id) {
    converted.subscriptionId = converted.subscription_id;
    delete converted.subscription_id;
  }
  
  // payment_cycle를 paymentCycle로 변환
  if (converted.payment_cycle) {
    converted.paymentCycle = converted.payment_cycle;
    delete converted.payment_cycle;
  }
  
  // payment_day를 paymentDay로 변환
  if (converted.payment_day) {
    converted.paymentDay = converted.payment_day;
    delete converted.payment_day;
  }
  
  // payment_method를 paymentMethod로 변환
  if (converted.payment_method) {
    converted.paymentMethod = converted.payment_method;
    delete converted.payment_method;
  }
  
  // start_date를 startDate로 변환
  if (converted.start_date) {
    converted.startDate = new Date(converted.start_date);
    delete converted.start_date;
  }
  
  // end_date를 endDate로 변환
  if (converted.end_date) {
    converted.endDate = new Date(converted.end_date);
    delete converted.end_date;
  }
  
  // auto_renewal을 autoRenewal로 변환
  if (converted.auto_renewal !== undefined) {
    converted.autoRenewal = converted.auto_renewal;
    delete converted.auto_renewal;
  }
  
  // created_at을 createdAt으로 변환
  if (converted.created_at) {
    converted.createdAt = new Date(converted.created_at);
    delete converted.created_at;
  }
  
  // updated_at을 updatedAt으로 변환
  if (converted.updated_at) {
    converted.updatedAt = new Date(converted.updated_at);
    delete converted.updated_at;
  }
  
  // payment_date를 paymentDate로 변환
  if (converted.payment_date) {
    converted.paymentDate = new Date(converted.payment_date);
    delete converted.payment_date;
  }
  
  // is_read를 isRead로 변환
  if (converted.is_read !== undefined) {
    converted.isRead = converted.is_read;
    delete converted.is_read;
  }
  
  // exchange_rate를 exchangeRate로 변환
  if (converted.exchange_rate) {
    converted.exchangeRate = converted.exchange_rate;
    delete converted.exchange_rate;
  }
  
  // default_currency를 defaultCurrency로 변환
  if (converted.default_currency) {
    converted.defaultCurrency = converted.default_currency;
    delete converted.default_currency;
  }
  
  // date_format을 dateFormat으로 변환
  if (converted.date_format) {
    converted.dateFormat = converted.date_format;
    delete converted.date_format;
  }
  
  // currency_format을 currencyFormat으로 변환
  if (converted.currency_format) {
    converted.currencyFormat = converted.currency_format;
    delete converted.currency_format;
  }
  
  return converted;
};

// 구독 데이터 마이그레이션
async function migrateSubscriptions() {
  console.log('🔄 구독 데이터 마이그레이션 시작...');
  
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 ${subscriptions.length}개의 구독 데이터 발견`);
    
    for (const subscription of subscriptions) {
      const convertedData = convertSupabaseToFirebase(subscription, subscription.user_id);
      
      try {
        await addDoc(collection(db, 'subscriptions'), convertedData);
        console.log(`✅ 구독 마이그레이션 완료: ${subscription.service_name}`);
      } catch (firebaseError) {
        console.error(`❌ 구독 마이그레이션 실패: ${subscription.service_name}`, firebaseError);
      }
    }
    
    console.log('✅ 구독 데이터 마이그레이션 완료');
  } catch (error) {
    console.error('❌ 구독 데이터 마이그레이션 실패:', error);
  }
}

// 알림 데이터 마이그레이션
async function migrateNotifications() {
  console.log('🔄 알림 데이터 마이그레이션 시작...');
  
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 ${notifications.length}개의 알림 데이터 발견`);
    
    for (const notification of notifications) {
      const convertedData = convertSupabaseToFirebase(notification, notification.user_id);
      
      try {
        await addDoc(collection(db, 'notifications'), convertedData);
        console.log(`✅ 알림 마이그레이션 완료: ${notification.title}`);
      } catch (firebaseError) {
        console.error(`❌ 알림 마이그레이션 실패: ${notification.title}`, firebaseError);
      }
    }
    
    console.log('✅ 알림 데이터 마이그레이션 완료');
  } catch (error) {
    console.error('❌ 알림 데이터 마이그레이션 실패:', error);
  }
}

// 사용자 설정 데이터 마이그레이션
async function migrateUserPreferences() {
  console.log('🔄 사용자 설정 데이터 마이그레이션 시작...');
  
  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 ${preferences.length}개의 사용자 설정 데이터 발견`);
    
    for (const preference of preferences) {
      const convertedData = convertSupabaseToFirebase(preference, preference.user_id);
      
      try {
        await addDoc(collection(db, 'userPreferences'), convertedData);
        console.log(`✅ 사용자 설정 마이그레이션 완료: ${preference.user_id}`);
      } catch (firebaseError) {
        console.error(`❌ 사용자 설정 마이그레이션 실패: ${preference.user_id}`, firebaseError);
      }
    }
    
    console.log('✅ 사용자 설정 데이터 마이그레이션 완료');
  } catch (error) {
    console.error('❌ 사용자 설정 데이터 마이그레이션 실패:', error);
  }
}

// 결제 내역 데이터 마이그레이션
async function migratePaymentHistory() {
  console.log('🔄 결제 내역 데이터 마이그레이션 시작...');
  
  try {
    const { data: payments, error } = await supabase
      .from('payment_history')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 ${payments.length}개의 결제 내역 데이터 발견`);
    
    for (const payment of payments) {
      const convertedData = convertSupabaseToFirebase(payment, payment.user_id);
      
      try {
        await addDoc(collection(db, 'paymentHistory'), convertedData);
        console.log(`✅ 결제 내역 마이그레이션 완료: ${payment.service_name}`);
      } catch (firebaseError) {
        console.error(`❌ 결제 내역 마이그레이션 실패: ${payment.service_name}`, firebaseError);
      }
    }
    
    console.log('✅ 결제 내역 데이터 마이그레이션 완료');
  } catch (error) {
    console.error('❌ 결제 내역 데이터 마이그레이션 실패:', error);
  }
}

// 기본 카테고리 데이터 생성
async function createDefaultCategories() {
  console.log('🔄 기본 카테고리 데이터 생성...');
  
  const defaultCategories = [
    { name: '엔터테인먼트', color: '#EF4444', icon: 'tv', description: '넷플릭스, 디즈니플러스 등' },
    { name: '음악', color: '#8B5CF6', icon: 'music', description: '스포티파이, 애플뮤직 등' },
    { name: '개발', color: '#06B6D4', icon: 'code', description: 'GitHub, Vercel 등' },
    { name: 'AI', color: '#10B981', icon: 'brain', description: 'ChatGPT, Claude 등' },
    { name: '디자인', color: '#F59E0B', icon: 'palette', description: 'Figma, Adobe 등' },
    { name: '생산성', color: '#3B82F6', icon: 'briefcase', description: 'Notion, Slack 등' },
    { name: '교육', color: '#06B6D4', icon: 'book-open', description: 'Coursera, Udemy 등' },
    { name: '피트니스', color: '#10B981', icon: 'activity', description: 'MyFitnessPal, Strava 등' },
    { name: '뉴스', color: '#6B7280', icon: 'newspaper', description: '뉴스 구독 서비스' },
    { name: '게임', color: '#8B5CF6', icon: 'gamepad-2', description: '게임 구독 서비스' },
    { name: '기타', color: '#6B7280', icon: 'more-horizontal', description: '기타 구독 서비스' }
  ];
  
  for (const category of defaultCategories) {
    try {
      await addDoc(collection(db, 'subscriptionCategories'), {
        ...category,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ 기본 카테고리 생성: ${category.name}`);
    } catch (error) {
      console.error(`❌ 기본 카테고리 생성 실패: ${category.name}`, error);
    }
  }
  
  console.log('✅ 기본 카테고리 데이터 생성 완료');
}

// 메인 마이그레이션 함수
async function migrateAll() {
  console.log('🚀 Firebase 마이그레이션 시작...');
  console.log('📋 마이그레이션할 데이터:');
  console.log('  - 구독 데이터');
  console.log('  - 알림 데이터');
  console.log('  - 사용자 설정 데이터');
  console.log('  - 결제 내역 데이터');
  console.log('  - 기본 카테고리 데이터');
  console.log('');
  
  try {
    // 기본 카테고리 먼저 생성
    await createDefaultCategories();
    
    // 데이터 마이그레이션
    await migrateSubscriptions();
    await migrateNotifications();
    await migrateUserPreferences();
    await migratePaymentHistory();
    
    console.log('');
    console.log('🎉 모든 데이터 마이그레이션 완료!');
    console.log('');
    console.log('📝 다음 단계:');
    console.log('  1. Firebase 콘솔에서 데이터 확인');
    console.log('  2. 보안 규칙 설정');
    console.log('  3. 코드에서 Firebase SDK 사용으로 변경');
    console.log('  4. 테스트 및 검증');
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateAll();
}

module.exports = {
  migrateAll,
  migrateSubscriptions,
  migrateNotifications,
  migrateUserPreferences,
  migratePaymentHistory,
  createDefaultCategories
}; 