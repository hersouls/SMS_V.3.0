const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
admin.initializeApp();
const db = admin.firestore();

// CORS 설정
const cors = require('cors')({
  origin: true,
  credentials: true
});

// 인증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    functions.logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 구독 관련 함수들
exports.getUserSubscriptions = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const subscriptionsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('subscriptions')
      .orderBy('nextPaymentDate', 'asc')
      .get();
    
    const subscriptions = [];
    subscriptionsSnapshot.forEach(doc => {
      subscriptions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { subscriptions };
  } catch (error) {
    functions.logger.error('Get subscriptions error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get subscriptions');
  }
});

exports.createSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const subscriptionData = {
      ...data,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 트랜잭션으로 구독 생성 및 사용자 통계 업데이트
    const result = await db.runTransaction(async (transaction) => {
      // 구독 생성
      const subscriptionRef = db
        .collection('users')
        .doc(userId)
        .collection('subscriptions')
        .doc();
      
      transaction.set(subscriptionRef, subscriptionData);
      
      // 사용자 통계 업데이트
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const stats = userData.stats || {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalMonthlyPayment: 0
        };
        
        transaction.update(userRef, {
          'stats.totalSubscriptions': stats.totalSubscriptions + 1,
          'stats.activeSubscriptions': stats.activeSubscriptions + 1,
          'stats.totalMonthlyPayment': stats.totalMonthlyPayment + data.amount,
          'stats.lastUpdated': admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return subscriptionRef.id;
    });
    
    return { id: result };
  } catch (error) {
    functions.logger.error('Create subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create subscription');
  }
});

exports.updateSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const { subscriptionId, ...updateData } = data;
    
    const subscriptionRef = db
      .collection('users')
      .doc(userId)
      .collection('subscriptions')
      .doc(subscriptionId);
    
    await subscriptionRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    functions.logger.error('Update subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update subscription');
  }
});

exports.deleteSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const { subscriptionId } = data;
    
    await db.runTransaction(async (transaction) => {
      // 구독 삭제
      const subscriptionRef = db
        .collection('users')
        .doc(userId)
        .collection('subscriptions')
        .doc(subscriptionId);
      
      const subscriptionDoc = await transaction.get(subscriptionRef);
      if (!subscriptionDoc.exists()) {
        throw new Error('Subscription not found');
      }
      
      const subscriptionData = subscriptionDoc.data();
      transaction.delete(subscriptionRef);
      
      // 사용자 통계 업데이트
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const stats = userData.stats || {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalMonthlyPayment: 0
        };
        
        transaction.update(userRef, {
          'stats.totalSubscriptions': Math.max(0, stats.totalSubscriptions - 1),
          'stats.activeSubscriptions': subscriptionData.isActive ? 
            Math.max(0, stats.activeSubscriptions - 1) : stats.activeSubscriptions,
          'stats.totalMonthlyPayment': Math.max(0, stats.totalMonthlyPayment - (subscriptionData.amount || 0)),
          'stats.lastUpdated': admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
    
    return { success: true };
  } catch (error) {
    functions.logger.error('Delete subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete subscription');
  }
});

// 알림 관련 함수들
exports.getUserNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const notificationsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { notifications };
  } catch (error) {
    functions.logger.error('Get notifications error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get notifications');
  }
});

exports.markNotificationAsRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const { notificationId } = data;
    
    await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId)
      .update({
        isRead: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true };
  } catch (error) {
    functions.logger.error('Mark notification as read error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to mark notification as read');
  }
});

// 사용자 관련 함수들
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists()) {
      // 새 사용자 문서 생성
      const userProfile = {
        id: userId,
        email: context.auth.token.email,
        displayName: context.auth.token.name || context.auth.token.email?.split('@')[0],
        photoURL: context.auth.token.picture,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        stats: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalMonthlyPayment: 0,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
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
      
      await db.collection('users').doc(userId).set(userProfile);
      return { profile: userProfile };
    }
    
    // 마지막 로그인 시간 업데이트
    await userDoc.ref.update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { profile: { id: userDoc.id, ...userDoc.data() } };
  } catch (error) {
    functions.logger.error('Get user profile error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user profile');
  }
});

// 환율 관련 함수
exports.getExchangeRates = functions.https.onCall(async (data, context) => {
  try {
    // 여기서는 간단한 예시를 제공합니다. 실제로는 외부 API를 호출해야 합니다.
    const rates = {
      USD: 1300,
      EUR: 1400,
      JPY: 9,
      CNY: 180,
      lastUpdated: new Date().toISOString()
    };
    
    return { rates };
  } catch (error) {
    functions.logger.error('Get exchange rates error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get exchange rates');
  }
});

// 스케줄된 함수 - 알림 생성
exports.createPaymentNotifications = functions.pubsub
  .schedule('0 9 * * *')  // 매일 오전 9시
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    try {
      const today = new Date();
      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // 모든 활성 구독 조회
      const usersSnapshot = await db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const subscriptionsSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('subscriptions')
          .where('isActive', '==', true)
          .get();
        
        for (const subDoc of subscriptionsSnapshot.docs) {
          const subscription = subDoc.data();
          const nextPaymentDate = subscription.nextPaymentDate?.toDate();
          
          if (!nextPaymentDate) continue;
          
          const daysDiff = Math.ceil((nextPaymentDate - today) / (24 * 60 * 60 * 1000));
          
          // 3일 전 또는 7일 전 알림 생성
          if ((daysDiff === 3 && subscription.notificationDays >= 3) ||
              (daysDiff === 7 && subscription.notificationDays >= 7)) {
            
            const notification = {
              type: 'payment_reminder',
              title: `${subscription.serviceName} 결제 예정`,
              message: `${daysDiff}일 후 ${subscription.serviceName} 구독료 ${subscription.amount.toLocaleString()}${subscription.currency}가 결제됩니다.`,
              subscriptionId: subDoc.id,
              subscriptionName: subscription.serviceName,
              amount: subscription.amount,
              isRead: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            await db
              .collection('users')
              .doc(userId)
              .collection('notifications')
              .add(notification);
          }
        }
      }
      
      functions.logger.info('Payment notifications created successfully');
    } catch (error) {
      functions.logger.error('Create payment notifications error:', error);
    }
  });