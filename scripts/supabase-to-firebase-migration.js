/**
 * Supabase to Firebase Migration Script
 * 
 * 이 스크립트는 Supabase 데이터를 Firebase Firestore로 마이그레이션합니다.
 * 
 * 사용법:
 * 1. 환경 변수 설정 (.env 파일)
 * 2. node scripts/supabase-to-firebase-migration.js [options]
 * 
 * Options:
 *   --dry-run     실제 마이그레이션 없이 테스트만 수행
 *   --users       사용자 데이터만 마이그레이션
 *   --data        구독 및 관련 데이터만 마이그레이션
 *   --batch-size  배치 크기 설정 (기본값: 500)
 */

const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const migrateUsersOnly = args.includes('--users');
const migrateDataOnly = args.includes('--data');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 500;

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Firebase Admin SDK 초기화
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// 진행 상황 추적
let progress = {
  users: { total: 0, migrated: 0, failed: 0 },
  subscriptions: { total: 0, migrated: 0, failed: 0 },
  notifications: { total: 0, migrated: 0, failed: 0 },
  categories: { total: 0, migrated: 0, failed: 0 },
  tags: { total: 0, migrated: 0, failed: 0 },
  payments: { total: 0, migrated: 0, failed: 0 },
  analytics: { total: 0, migrated: 0, failed: 0 }
};

// 로그 파일 설정
const logFile = path.join(__dirname, `migration-${new Date().toISOString().split('T')[0]}.log`);

async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  await fs.appendFile(logFile, logMessage);
}

// 사용자 마이그레이션
async function migrateUsers() {
  await log('사용자 마이그레이션 시작...');
  
  try {
    // Supabase에서 모든 사용자 가져오기
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    progress.users.total = users.users.length;
    await log(`총 ${progress.users.total}명의 사용자를 마이그레이션합니다.`);
    
    for (const user of users.users) {
      try {
        // Firebase Auth에 사용자 생성
        const firebaseUser = await auth.createUser({
          uid: user.id,
          email: user.email,
          emailVerified: user.email_confirmed_at !== null,
          displayName: user.user_metadata?.full_name || user.email.split('@')[0],
          photoURL: user.user_metadata?.avatar_url,
          disabled: false
        });
        
        // Firestore에 사용자 문서 생성
        const userDoc = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
          updatedAt: admin.firestore.Timestamp.now(),
          lastLoginAt: user.last_sign_in_at ? 
            admin.firestore.Timestamp.fromDate(new Date(user.last_sign_in_at)) : null,
          isActive: true,
          stats: {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            totalMonthlyPayment: 0,
            lastUpdated: admin.firestore.Timestamp.now()
          },
          settings: {
            currency: 'KRW',
            language: 'ko',
            timezone: 'Asia/Seoul',
            notifications: {
              email: true,
              push: true,
              paymentReminders: true
            }
          }
        };
        
        if (!isDryRun) {
          await db.collection('users').doc(firebaseUser.uid).set(userDoc);
        }
        
        progress.users.migrated++;
        await log(`사용자 마이그레이션 성공: ${user.email}`);
        
      } catch (error) {
        progress.users.failed++;
        await log(`사용자 마이그레이션 실패: ${user.email} - ${error.message}`, 'ERROR');
      }
    }
    
  } catch (error) {
    await log(`사용자 목록 가져오기 실패: ${error.message}`, 'ERROR');
  }
  
  await log(`사용자 마이그레이션 완료: 성공 ${progress.users.migrated}, 실패 ${progress.users.failed}`);
}

// 카테고리 마이그레이션
async function migrateCategories() {
  await log('카테고리 마이그레이션 시작...');
  
  const { data: categories, error } = await supabase
    .from('subscription_categories')
    .select('*')
    .order('name');
    
  if (error) {
    await log(`카테고리 가져오기 실패: ${error.message}`, 'ERROR');
    return;
  }
  
  progress.categories.total = categories.length;
  
  for (const category of categories) {
    try {
      const categoryDoc = {
        id: category.id,
        name: category.name,
        nameKo: category.name_ko || category.name,
        icon: category.icon || 'category',
        color: category.color || '#6B7280',
        order: category.order || 999,
        isDefault: category.user_id === null,
        isActive: true,
        usageCount: 0,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(category.created_at)),
        updatedAt: admin.firestore.Timestamp.now()
      };
      
      if (!isDryRun) {
        await db.collection('categories').doc(category.id).set(categoryDoc);
      }
      
      progress.categories.migrated++;
      await log(`카테고리 마이그레이션 성공: ${category.name}`);
      
    } catch (error) {
      progress.categories.failed++;
      await log(`카테고리 마이그레이션 실패: ${category.name} - ${error.message}`, 'ERROR');
    }
  }
  
  await log(`카테고리 마이그레이션 완료: 성공 ${progress.categories.migrated}, 실패 ${progress.categories.failed}`);
}

// 구독 마이그레이션
async function migrateSubscriptions() {
  await log('구독 데이터 마이그레이션 시작...');
  
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_categories(name),
      subscription_tag_relations(
        subscription_tags(id, name)
      )
    `)
    .order('created_at');
    
  if (error) {
    await log(`구독 데이터 가져오기 실패: ${error.message}`, 'ERROR');
    return;
  }
  
  progress.subscriptions.total = subscriptions.length;
  
  // 사용자별로 그룹화
  const subscriptionsByUser = {};
  subscriptions.forEach(sub => {
    if (!subscriptionsByUser[sub.user_id]) {
      subscriptionsByUser[sub.user_id] = [];
    }
    subscriptionsByUser[sub.user_id].push(sub);
  });
  
  // 사용자별로 배치 처리
  for (const [userId, userSubs] of Object.entries(subscriptionsByUser)) {
    const batch = db.batch();
    let batchCount = 0;
    
    for (const sub of userSubs) {
      try {
        const subscriptionRef = db
          .collection('users')
          .doc(userId)
          .collection('subscriptions')
          .doc(sub.id);
          
        const subscriptionDoc = {
          id: sub.id,
          serviceName: sub.service_name,
          serviceUrl: sub.service_url,
          logoUrl: sub.logo_url,
          amount: sub.amount,
          currency: sub.currency || 'KRW',
          billingCycle: sub.billing_cycle,
          customBillingDays: sub.custom_billing_days,
          startDate: admin.firestore.Timestamp.fromDate(new Date(sub.start_date)),
          nextPaymentDate: admin.firestore.Timestamp.fromDate(new Date(sub.next_payment_date)),
          lastPaymentDate: sub.last_payment_date ? 
            admin.firestore.Timestamp.fromDate(new Date(sub.last_payment_date)) : null,
          endDate: sub.end_date ? 
            admin.firestore.Timestamp.fromDate(new Date(sub.end_date)) : null,
          isActive: sub.is_active,
          isPaused: sub.is_paused || false,
          categoryId: sub.category_id,
          categoryName: sub.subscription_categories?.name || 'Unknown',
          tagIds: sub.subscription_tag_relations?.map(rel => rel.subscription_tags.id) || [],
          notificationDays: sub.notification_days || 3,
          notificationEnabled: sub.notification_enabled !== false,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(sub.created_at)),
          updatedAt: admin.firestore.Timestamp.now(),
          notes: sub.notes,
          totalPaid: sub.total_paid || 0,
          paymentCount: sub.payment_count || 0
        };
        
        if (!isDryRun) {
          batch.set(subscriptionRef, subscriptionDoc);
        }
        
        batchCount++;
        
        // 배치 크기 제한
        if (batchCount >= BATCH_SIZE) {
          if (!isDryRun) {
            await batch.commit();
          }
          batchCount = 0;
        }
        
        progress.subscriptions.migrated++;
        
      } catch (error) {
        progress.subscriptions.failed++;
        await log(`구독 마이그레이션 실패: ${sub.service_name} - ${error.message}`, 'ERROR');
      }
    }
    
    // 남은 배치 커밋
    if (batchCount > 0 && !isDryRun) {
      await batch.commit();
    }
    
    // 사용자 통계 업데이트
    if (!isDryRun) {
      await updateUserStats(userId);
    }
  }
  
  await log(`구독 마이그레이션 완료: 성공 ${progress.subscriptions.migrated}, 실패 ${progress.subscriptions.failed}`);
}

// 알림 마이그레이션
async function migrateNotifications() {
  await log('알림 데이터 마이그레이션 시작...');
  
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    await log(`알림 데이터 가져오기 실패: ${error.message}`, 'ERROR');
    return;
  }
  
  progress.notifications.total = notifications.length;
  
  // 사용자별로 그룹화
  const notificationsByUser = {};
  notifications.forEach(notif => {
    if (!notificationsByUser[notif.user_id]) {
      notificationsByUser[notif.user_id] = [];
    }
    notificationsByUser[notif.user_id].push(notif);
  });
  
  for (const [userId, userNotifs] of Object.entries(notificationsByUser)) {
    const batch = db.batch();
    let batchCount = 0;
    
    for (const notif of userNotifs) {
      try {
        const notificationRef = db
          .collection('users')
          .doc(userId)
          .collection('notifications')
          .doc(notif.id);
          
        const notificationDoc = {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          actionUrl: notif.action_url,
          subscriptionId: notif.subscription_id,
          subscriptionName: notif.subscription_name,
          amount: notif.amount,
          isRead: notif.is_read,
          readAt: notif.read_at ? 
            admin.firestore.Timestamp.fromDate(new Date(notif.read_at)) : null,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(notif.created_at)),
          expiresAt: notif.expires_at ? 
            admin.firestore.Timestamp.fromDate(new Date(notif.expires_at)) : null
        };
        
        if (!isDryRun) {
          batch.set(notificationRef, notificationDoc);
        }
        
        batchCount++;
        
        if (batchCount >= BATCH_SIZE) {
          if (!isDryRun) {
            await batch.commit();
          }
          batchCount = 0;
        }
        
        progress.notifications.migrated++;
        
      } catch (error) {
        progress.notifications.failed++;
        await log(`알림 마이그레이션 실패: ${notif.title} - ${error.message}`, 'ERROR');
      }
    }
    
    if (batchCount > 0 && !isDryRun) {
      await batch.commit();
    }
  }
  
  await log(`알림 마이그레이션 완료: 성공 ${progress.notifications.migrated}, 실패 ${progress.notifications.failed}`);
}

// 사용자 통계 업데이트
async function updateUserStats(userId) {
  try {
    const subscriptionsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('subscriptions')
      .get();
      
    let totalSubscriptions = 0;
    let activeSubscriptions = 0;
    let totalMonthlyPayment = 0;
    
    subscriptionsSnapshot.forEach(doc => {
      const sub = doc.data();
      totalSubscriptions++;
      
      if (sub.isActive) {
        activeSubscriptions++;
        
        // 월간 금액 계산
        let monthlyAmount = sub.amount;
        if (sub.billingCycle === 'yearly') {
          monthlyAmount = sub.amount / 12;
        } else if (sub.billingCycle === 'weekly') {
          monthlyAmount = sub.amount * 4.33;
        }
        
        totalMonthlyPayment += monthlyAmount;
      }
    });
    
    await db.collection('users').doc(userId).update({
      'stats.totalSubscriptions': totalSubscriptions,
      'stats.activeSubscriptions': activeSubscriptions,
      'stats.totalMonthlyPayment': totalMonthlyPayment,
      'stats.lastUpdated': admin.firestore.Timestamp.now()
    });
    
  } catch (error) {
    await log(`사용자 통계 업데이트 실패: ${userId} - ${error.message}`, 'ERROR');
  }
}

// 마이그레이션 보고서 생성
async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    isDryRun,
    progress,
    summary: {
      totalItems: Object.values(progress).reduce((sum, item) => sum + item.total, 0),
      totalMigrated: Object.values(progress).reduce((sum, item) => sum + item.migrated, 0),
      totalFailed: Object.values(progress).reduce((sum, item) => sum + item.failed, 0)
    }
  };
  
  const reportFile = path.join(__dirname, `migration-report-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  
  await log(`마이그레이션 보고서 생성됨: ${reportFile}`);
  
  console.log('\n=== 마이그레이션 요약 ===');
  console.log(`총 항목: ${report.summary.totalItems}`);
  console.log(`마이그레이션 성공: ${report.summary.totalMigrated}`);
  console.log(`마이그레이션 실패: ${report.summary.totalFailed}`);
  console.log(`성공률: ${(report.summary.totalMigrated / report.summary.totalItems * 100).toFixed(2)}%`);
}

// 메인 마이그레이션 함수
async function main() {
  try {
    await log('=== Supabase to Firebase 마이그레이션 시작 ===');
    await log(`모드: ${isDryRun ? 'DRY RUN (테스트)' : 'PRODUCTION (실제 마이그레이션)'}`);
    await log(`배치 크기: ${BATCH_SIZE}`);
    
    // 1. 사용자 마이그레이션
    if (!migrateDataOnly) {
      await migrateUsers();
    }
    
    // 2. 카테고리 마이그레이션
    if (!migrateUsersOnly) {
      await migrateCategories();
    }
    
    // 3. 구독 데이터 마이그레이션
    if (!migrateUsersOnly) {
      await migrateSubscriptions();
    }
    
    // 4. 알림 마이그레이션
    if (!migrateUsersOnly) {
      await migrateNotifications();
    }
    
    // 5. 보고서 생성
    await generateReport();
    
    await log('=== 마이그레이션 완료 ===');
    
  } catch (error) {
    await log(`마이그레이션 중 치명적 오류 발생: ${error.message}`, 'FATAL');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().then(() => {
    console.log('\n마이그레이션 프로세스가 완료되었습니다.');
    process.exit(0);
  }).catch(error => {
    console.error('\n마이그레이션 실패:', error);
    process.exit(1);
  });
}

module.exports = { migrateUsers, migrateCategories, migrateSubscriptions, migrateNotifications };