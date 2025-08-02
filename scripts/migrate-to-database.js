#!/usr/bin/env node

/**
 * KV 스토어에서 Supabase 데이터베이스로 마이그레이션 스크립트
 * 
 * 사용법:
 * node scripts/migrate-to-database.js [userId]
 * 
 * userId가 제공되지 않으면 모든 사용자의 데이터를 마이그레이션합니다.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// KV 스토어에서 데이터 조회 함수
async function getKVData(userId = null) {
  try {
    let query = supabase
      .from('kv_store_7a0e61a7')
      .select('*');

    if (userId) {
      query = query.or(`key.like.subscription:${userId}:%,key.like.user_settings:${userId}`);
    } else {
      query = query.or('key.like.subscription:%,key.like.user_settings:%');
    }

    const { data, error } = await query;

    if (error) {
      console.error('KV 데이터 조회 오류:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('KV 데이터 조회 실패:', error);
    throw error;
  }
}

// 구독 데이터 변환 함수
function transformSubscription(kvData) {
  const subscription = kvData.value;
  
  return {
    service_name: subscription.serviceName,
    service_url: subscription.serviceUrl,
    logo: subscription.logo,
    logo_image: subscription.logoImage,
    amount: subscription.amount,
    currency: subscription.currency,
    payment_cycle: subscription.paymentCycle,
    payment_day: subscription.paymentDay,
    payment_method: subscription.paymentMethod,
    start_date: subscription.startDate,
    auto_renewal: subscription.autoRenewal,
    status: subscription.status,
    category: subscription.category,
    tier: subscription.tier,
    memo: subscription.memo,
    notifications: subscription.notifications
  };
}

// 사용자 설정 데이터 변환 함수
function transformUserSettings(kvData) {
  const settings = kvData.value;
  
  return {
    exchange_rate: settings.exchangeRate,
    notifications: settings.notifications
  };
}

// 구독 데이터 마이그레이션
async function migrateSubscriptions(userId, kvData) {
  const subscriptions = kvData.filter(item => 
    item.key.startsWith(`subscription:${userId}:`)
  );

  console.log(`사용자 ${userId}의 구독 ${subscriptions.length}개 마이그레이션 중...`);

  for (const kvItem of subscriptions) {
    try {
      const subscriptionData = transformSubscription(kvItem);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          ...subscriptionData
        })
        .select()
        .single();

      if (error) {
        console.error(`구독 마이그레이션 실패 (${kvItem.key}):`, error);
      } else {
        console.log(`✓ 구독 마이그레이션 완료: ${subscriptionData.service_name}`);
      }
    } catch (error) {
      console.error(`구독 마이그레이션 오류 (${kvItem.key}):`, error);
    }
  }
}

// 사용자 설정 마이그레이션
async function migrateUserSettings(userId, kvData) {
  const settingsData = kvData.find(item => 
    item.key === `user_settings:${userId}`
  );

  if (settingsData) {
    try {
      const settings = transformUserSettings(settingsData);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...settings
        })
        .select()
        .single();

      if (error) {
        console.error(`사용자 설정 마이그레이션 실패 (${userId}):`, error);
      } else {
        console.log(`✓ 사용자 설정 마이그레이션 완료: ${userId}`);
      }
    } catch (error) {
      console.error(`사용자 설정 마이그레이션 오류 (${userId}):`, error);
    }
  } else {
    console.log(`사용자 설정 데이터 없음: ${userId}`);
  }
}

// 사용자별 마이그레이션
async function migrateUserData(userId) {
  try {
    console.log(`\n=== 사용자 ${userId} 마이그레이션 시작 ===`);
    
    const kvData = await getKVData(userId);
    
    if (kvData.length === 0) {
      console.log(`사용자 ${userId}의 데이터가 없습니다.`);
      return;
    }

    // 구독 데이터 마이그레이션
    await migrateSubscriptions(userId, kvData);
    
    // 사용자 설정 마이그레이션
    await migrateUserSettings(userId, kvData);
    
    console.log(`=== 사용자 ${userId} 마이그레이션 완료 ===\n`);
  } catch (error) {
    console.error(`사용자 ${userId} 마이그레이션 실패:`, error);
  }
}

// 모든 사용자 마이그레이션
async function migrateAllUsers() {
  try {
    console.log('\n=== 모든 사용자 마이그레이션 시작 ===');
    
    const kvData = await getKVData();
    
    if (kvData.length === 0) {
      console.log('마이그레이션할 데이터가 없습니다.');
      return;
    }

    // 사용자 ID 추출
    const userIds = new Set();
    
    kvData.forEach(item => {
      if (item.key.startsWith('subscription:')) {
        const parts = item.key.split(':');
        if (parts.length >= 3) {
          userIds.add(parts[1]);
        }
      } else if (item.key.startsWith('user_settings:')) {
        const parts = item.key.split(':');
        if (parts.length >= 2) {
          userIds.add(parts[1]);
        }
      }
    });

    console.log(`총 ${userIds.size}명의 사용자 데이터를 마이그레이션합니다.`);

    for (const userId of userIds) {
      await migrateUserData(userId);
    }

    console.log('=== 모든 사용자 마이그레이션 완료 ===\n');
  } catch (error) {
    console.error('전체 마이그레이션 실패:', error);
  }
}

// 마이그레이션 검증
async function verifyMigration(userId = null) {
  try {
    console.log('\n=== 마이그레이션 검증 시작 ===');
    
    const kvData = await getKVData(userId);
    const userIds = userId ? [userId] : [...new Set(kvData.map(item => {
      if (item.key.startsWith('subscription:')) {
        return item.key.split(':')[1];
      } else if (item.key.startsWith('user_settings:')) {
        return item.key.split(':')[1];
      }
      return null;
    }).filter(Boolean))];

    for (const uid of userIds) {
      console.log(`\n사용자 ${uid} 검증 중...`);
      
      // KV 스토어 데이터
      const kvSubscriptions = kvData.filter(item => 
        item.key.startsWith(`subscription:${uid}:`)
      );
      const kvSettings = kvData.find(item => 
        item.key === `user_settings:${uid}`
      );

      // 데이터베이스 데이터
      const { data: dbSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', uid);

      const { data: dbSettings } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', uid)
        .single();

      // 비교
      console.log(`KV 구독: ${kvSubscriptions.length}개, DB 구독: ${dbSubscriptions?.length || 0}개`);
      console.log(`KV 설정: ${kvSettings ? '있음' : '없음'}, DB 설정: ${dbSettings ? '있음' : '없음'}`);

      if (kvSubscriptions.length !== (dbSubscriptions?.length || 0)) {
        console.log('⚠️  구독 개수가 일치하지 않습니다!');
      }

      if (!kvSettings && dbSettings) {
        console.log('⚠️  설정 데이터 불일치!');
      }
    }

    console.log('\n=== 마이그레이션 검증 완료 ===');
  } catch (error) {
    console.error('검증 실패:', error);
  }
}

// 메인 함수
async function main() {
  const userId = process.argv[2];
  
  console.log('🚀 KV 스토어에서 Supabase 데이터베이스로 마이그레이션 시작');
  console.log('환경:', process.env.NODE_ENV || 'development');
  
  if (userId) {
    console.log(`대상 사용자: ${userId}`);
    await migrateUserData(userId);
    await verifyMigration(userId);
  } else {
    console.log('모든 사용자 마이그레이션');
    await migrateAllUsers();
    await verifyMigration();
  }
  
  console.log('\n✅ 마이그레이션 완료!');
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 