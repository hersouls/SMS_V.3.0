// Firebase 기반 API 서비스
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebase/config';

class FirebaseApiService {
  private currentUser: FirebaseUser | null = null;

  constructor() {
    console.log('🚀 FirebaseApiService 초기화됨');
    
    // Auth 상태 구독
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      console.log('🔑 Auth 상태 변경:', user ? `${user.email} 로그인` : '로그아웃');
    });
  }

  // =====================================================
  // 헬퍼 함수들
  // =====================================================

  private async ensureAuthenticated() {
    if (!this.currentUser) {
      throw new Error('사용자 인증이 필요합니다. 다시 로그인해주세요.');
    }
    return this.currentUser;
  }

  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    return new Date(timestamp).toISOString();
  }

  // =====================================================
  // 인증 API
  // =====================================================

  async login(email: string, password: string) {
    try {
      console.log('🔑 Firebase 로그인 시도:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase 로그인 성공:', user.uid);
      return {
        user: {
          id: user.uid,
          email: user.email!,
          name: user.displayName || undefined
        }
      };
    } catch (error: any) {
      console.error('❌ Firebase 로그인 실패:', error);
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  }

  async loginWithGoogle() {
    try {
      console.log('🔑 Google 로그인 시도');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // 사용자 정보를 Firestore에 저장
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Google 로그인 성공:', user.uid);
      return {
        user: {
          id: user.uid,
          email: user.email!,
          name: user.displayName || undefined
        }
      };
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      throw new Error(error.message || 'Google 로그인에 실패했습니다.');
    }
  }

  async signup(email: string, password: string, name?: string) {
    try {
      console.log('📝 Firebase 회원가입 시도:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 사용자 정보를 Firestore에 저장
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        name: name || '',
        joinDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // 기본 사용자 설정 생성
      const preferencesRef = doc(db, 'preferences', user.uid);
      await setDoc(preferencesRef, {
        userId: user.uid,
        exchangeRate: 1300,
        defaultCurrency: 'KRW',
        notifications: {
          paymentReminders: true,
          priceChanges: false,
          subscriptionExpiry: true,
          email: true,
          push: true,
          sms: false
        },
        theme: 'auto',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: 'KRW',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Firebase 회원가입 성공:', user.uid);
      return {
        user: {
          id: user.uid,
          email: user.email!,
          name: name || undefined
        }
      };
    } catch (error: any) {
      console.error('❌ Firebase 회원가입 실패:', error);
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }
  }

  async logout() {
    try {
      console.log('🚪 Firebase 로그아웃 시도');
      await signOut(auth);
      console.log('✅ Firebase 로그아웃 성공');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Firebase 로그아웃 실패:', error);
      throw new Error(error.message || '로그아웃에 실패했습니다.');
    }
  }

  // =====================================================
  // 구독 API
  // =====================================================

  async getSubscriptions() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 구독 목록 가져오기:', user.uid);
      
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const subscriptions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.formatTimestamp(doc.data().createdAt),
        updatedAt: this.formatTimestamp(doc.data().updatedAt),
        startDate: this.formatTimestamp(doc.data().startDate),
        endDate: doc.data().endDate ? this.formatTimestamp(doc.data().endDate) : undefined
      }));
      
      console.log('✅ 구독 목록 가져오기 성공:', subscriptions.length);
      return { subscriptions };
    } catch (error: any) {
      console.error('❌ 구독 목록 가져오기 실패:', error);
      throw new Error(error.message || '구독 목록을 가져오는데 실패했습니다.');
    }
  }

  async getSubscription(id: string) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 구독 상세 정보 가져오기:', id);
      
      const subscriptionRef = doc(db, 'subscriptions', id);
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        throw new Error('구독을 찾을 수 없습니다.');
      }
      
      const data = subscriptionDoc.data();
      if (data.userId !== user.uid) {
        throw new Error('권한이 없습니다.');
      }
      
      const subscription = {
        id: subscriptionDoc.id,
        ...data,
        createdAt: this.formatTimestamp(data.createdAt),
        updatedAt: this.formatTimestamp(data.updatedAt),
        startDate: this.formatTimestamp(data.startDate),
        endDate: data.endDate ? this.formatTimestamp(data.endDate) : undefined
      };
      
      console.log('✅ 구독 상세 정보 가져오기 성공');
      return { subscription };
    } catch (error: any) {
      console.error('❌ 구독 상세 정보 가져오기 실패:', error);
      throw new Error(error.message || '구독 정보를 가져오는데 실패했습니다.');
    }
  }

  async createSubscription(subscription: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('➕ 구독 생성:', subscription);
      
      const subscriptionData = {
        ...subscription,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: Timestamp.fromDate(new Date(subscription.startDate)),
        endDate: subscription.endDate ? Timestamp.fromDate(new Date(subscription.endDate)) : null
      };
      
      const subscriptionsRef = collection(db, 'subscriptions');
      const docRef = doc(subscriptionsRef);
      await setDoc(docRef, subscriptionData);
      
      console.log('✅ 구독 생성 성공');
      return { 
        subscription: {
          ...subscriptionData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          startDate: subscription.startDate,
          endDate: subscription.endDate
        }
      };
    } catch (error: any) {
      console.error('❌ 구독 생성 실패:', error);
      throw new Error(error.message || '구독 생성에 실패했습니다.');
    }
  }

  async updateSubscription(id: string, updates: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('✏️ 구독 수정:', id);
      
      const subscriptionRef = doc(db, 'subscriptions', id);
      
      // 권한 확인
      const subscriptionDoc = await getDoc(subscriptionRef);
      if (!subscriptionDoc.exists() || subscriptionDoc.data().userId !== user.uid) {
        throw new Error('권한이 없습니다.');
      }
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }
      
      await updateDoc(subscriptionRef, updateData);
      
      // 업데이트된 데이터 반환
      const updatedDoc = await getDoc(subscriptionRef);
      const data = updatedDoc.data()!;
      
      console.log('✅ 구독 수정 성공');
      return { 
        subscription: {
          id: updatedDoc.id,
          ...data,
          createdAt: this.formatTimestamp(data.createdAt),
          updatedAt: this.formatTimestamp(data.updatedAt),
          startDate: this.formatTimestamp(data.startDate),
          endDate: data.endDate ? this.formatTimestamp(data.endDate) : undefined
        }
      };
    } catch (error: any) {
      console.error('❌ 구독 수정 실패:', error);
      throw new Error(error.message || '구독 수정에 실패했습니다.');
    }
  }

  async deleteSubscription(id: string) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('🗑️ 구독 삭제:', id);
      
      const subscriptionRef = doc(db, 'subscriptions', id);
      
      // 권한 확인
      const subscriptionDoc = await getDoc(subscriptionRef);
      if (!subscriptionDoc.exists() || subscriptionDoc.data().userId !== user.uid) {
        throw new Error('권한이 없습니다.');
      }
      
      await deleteDoc(subscriptionRef);
      
      console.log('✅ 구독 삭제 성공');
      return { success: true };
    } catch (error: any) {
      console.error('❌ 구독 삭제 실패:', error);
      throw new Error(error.message || '구독 삭제에 실패했습니다.');
    }
  }

  // =====================================================
  // 사용자 설정 API
  // =====================================================

  async getPreferences() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('⚙️ 사용자 설정 가져오기:', user.uid);
      
      const preferencesRef = doc(db, 'preferences', user.uid);
      const preferencesDoc = await getDoc(preferencesRef);
      
      if (!preferencesDoc.exists()) {
        // 기본 설정 반환
        return {
          preferences: {
            userId: user.uid,
            exchangeRate: 1300,
            defaultCurrency: 'KRW',
            notifications: {
              paymentReminders: true,
              priceChanges: false,
              subscriptionExpiry: true,
              email: true,
              push: true,
              sms: false
            },
            theme: 'auto',
            language: 'ko',
            timezone: 'Asia/Seoul',
            dateFormat: 'YYYY-MM-DD',
            currencyFormat: 'KRW'
          }
        };
      }
      
      console.log('✅ 사용자 설정 가져오기 성공');
      return { preferences: preferencesDoc.data() };
    } catch (error: any) {
      console.error('❌ 사용자 설정 가져오기 실패:', error);
      throw new Error(error.message || '사용자 설정을 가져오는데 실패했습니다.');
    }
  }

  async updatePreferences(updates: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('✏️ 사용자 설정 수정:', updates);
      
      const preferencesRef = doc(db, 'preferences', user.uid);
      
      await setDoc(preferencesRef, {
        ...updates,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      const updatedDoc = await getDoc(preferencesRef);
      
      console.log('✅ 사용자 설정 수정 성공');
      return { preferences: updatedDoc.data() };
    } catch (error: any) {
      console.error('❌ 사용자 설정 수정 실패:', error);
      throw new Error(error.message || '사용자 설정 수정에 실패했습니다.');
    }
  }

  // =====================================================
  // 알림 API
  // =====================================================

  async getNotifications() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('🔔 알림 목록 가져오기:', user.uid);
      
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.formatTimestamp(doc.data().createdAt),
        updatedAt: this.formatTimestamp(doc.data().updatedAt)
      }));
      
      console.log('✅ 알림 목록 가져오기 성공:', notifications.length);
      return { notifications };
    } catch (error: any) {
      console.error('❌ 알림 목록 가져오기 실패:', error);
      throw new Error(error.message || '알림 목록을 가져오는데 실패했습니다.');
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('✓ 알림 읽음 처리:', id);
      
      const notificationRef = doc(db, 'notifications', id);
      
      // 권한 확인
      const notificationDoc = await getDoc(notificationRef);
      if (!notificationDoc.exists() || notificationDoc.data().userId !== user.uid) {
        throw new Error('권한이 없습니다.');
      }
      
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ 알림 읽음 처리 성공');
      return { success: true };
    } catch (error: any) {
      console.error('❌ 알림 읽음 처리 실패:', error);
      throw new Error(error.message || '알림 읽음 처리에 실패했습니다.');
    }
  }

  // =====================================================
  // 카테고리 API
  // =====================================================

  async getCategories() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('🗂️ 카테고리 목록 가져오기:', user.uid);
      
      const categoriesRef = collection(db, 'categories');
      const q = query(
        categoriesRef,
        where('userId', '==', user.uid),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.formatTimestamp(doc.data().createdAt),
        updatedAt: this.formatTimestamp(doc.data().updatedAt)
      }));
      
      console.log('✅ 카테고리 목록 가져오기 성공:', categories.length);
      return { categories };
    } catch (error: any) {
      console.error('❌ 카테고리 목록 가져오기 실패:', error);
      throw new Error(error.message || '카테고리 목록을 가져오는데 실패했습니다.');
    }
  }

  async createCategory(category: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('➕ 카테고리 생성:', category);
      
      const categoryData = {
        ...category,
        userId: user.uid,
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const categoriesRef = collection(db, 'categories');
      const docRef = doc(categoriesRef);
      await setDoc(docRef, categoryData);
      
      console.log('✅ 카테고리 생성 성공');
      return { 
        category: {
          ...categoryData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('❌ 카테고리 생성 실패:', error);
      throw new Error(error.message || '카테고리 생성에 실패했습니다.');
    }
  }

  // =====================================================
  // 통계 API
  // =====================================================

  async getStatistics() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📈 통계 데이터 가져오기:', user.uid);
      
      // 구독 데이터 가져오기
      const { subscriptions } = await this.getSubscriptions();
      const { preferences } = await this.getPreferences();
      
      // 기본 통계 계산
      const stats = {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter((s: any) => s.status === 'active').length,
        pausedSubscriptions: subscriptions.filter((s: any) => s.status === 'paused').length,
        cancelledSubscriptions: subscriptions.filter((s: any) => s.status === 'cancelled').length,
        totalMonthlyKrw: 0,
        avgSubscriptionCost: 0,
        upcomingPayments: 0,
        todayCount: 0,
        weekCount: 0
      };
      
      // 월간 총액 계산
      subscriptions.forEach((sub: any) => {
        if (sub.status === 'active') {
          const amount = sub.currency === 'USD' 
            ? sub.amount * (preferences?.exchangeRate || 1300) 
            : sub.amount;
          
          if (sub.paymentCycle === 'monthly') {
            stats.totalMonthlyKrw += amount;
          } else if (sub.paymentCycle === 'yearly') {
            stats.totalMonthlyKrw += amount / 12;
          }
        }
      });
      
      stats.avgSubscriptionCost = stats.activeSubscriptions > 0 
        ? stats.totalMonthlyKrw / stats.activeSubscriptions 
        : 0;
      
      console.log('✅ 통계 데이터 가져오기 성공');
      return { statistics: stats };
    } catch (error: any) {
      console.error('❌ 통계 데이터 가져오기 실패:', error);
      throw new Error(error.message || '통계 데이터를 가져오는데 실패했습니다.');
    }
  }

  // =====================================================
  // 통계 리포트 API
  // =====================================================

  async getStatisticsReports(reportType: 'monthly' | 'quarterly' | 'yearly' | 'all' = 'all') {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 통계 리포트 가져오기:', user.uid, reportType);
      
      const reportsRef = collection(db, 'statisticsReports');
      let q = query(
        reportsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      if (reportType !== 'all') {
        q = query(
          reportsRef,
          where('userId', '==', user.uid),
          where('reportType', '==', reportType),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.formatTimestamp(doc.data().createdAt),
        updatedAt: this.formatTimestamp(doc.data().updatedAt)
      }));
      
      console.log('✅ 통계 리포트 가져오기 성공:', reports.length);
      return { reports };
    } catch (error: any) {
      console.error('❌ 통계 리포트 가져오기 실패:', error);
      throw new Error(error.message || '통계 리포트를 가져오는데 실패했습니다.');
    }
  }

  async getStatisticsReport(reportId: string) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 통계 리포트 상세 가져오기:', reportId);
      
      const reportRef = doc(db, 'statisticsReports', reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('통계 리포트를 찾을 수 없습니다.');
      }
      
      const data = reportDoc.data();
      if (data.userId !== user.uid) {
        throw new Error('접근 권한이 없습니다.');
      }
      
      const report = {
        id: reportDoc.id,
        ...data,
        createdAt: this.formatTimestamp(data.createdAt),
        updatedAt: this.formatTimestamp(data.updatedAt)
      };
      
      console.log('✅ 통계 리포트 상세 가져오기 성공');
      return { report };
    } catch (error: any) {
      console.error('❌ 통계 리포트 상세 가져오기 실패:', error);
      throw new Error(error.message || '통계 리포트 상세 정보를 가져오는데 실패했습니다.');
    }
  }

  async createStatisticsReport(reportData: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 통계 리포트 생성:', reportData.reportType);
      
      const newReport = {
        ...reportData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'statisticsReports'), newReport);
      console.log('✅ 통계 리포트 생성 성공:', docRef.id);
      
      return { id: docRef.id, error: null };
    } catch (error: any) {
      console.error('❌ 통계 리포트 생성 실패:', error);
      return { id: null, error };
    }
  }

  async updateStatisticsReport(reportId: string, reportData: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 통계 리포트 업데이트:', reportId);
      
      const reportRef = doc(db, 'statisticsReports', reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('통계 리포트를 찾을 수 없습니다.');
      }
      
      const existingData = reportDoc.data();
      if (existingData.userId !== user.uid) {
        throw new Error('접근 권한이 없습니다.');
      }
      
      const updateData = {
        ...reportData,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(reportRef, updateData);
      console.log('✅ 통계 리포트 업데이트 성공');
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 통계 리포트 업데이트 실패:', error);
      return { success: false, error };
    }
  }

  async deleteStatisticsReport(reportId: string) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('📊 통계 리포트 삭제:', reportId);
      
      const reportRef = doc(db, 'statisticsReports', reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('통계 리포트를 찾을 수 없습니다.');
      }
      
      const existingData = reportDoc.data();
      if (existingData.userId !== user.uid) {
        throw new Error('접근 권한이 없습니다.');
      }
      
      await deleteDoc(reportRef);
      console.log('✅ 통계 리포트 삭제 성공');
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 통계 리포트 삭제 실패:', error);
      return { success: false, error };
    }
  }

  async getStatisticsConfig() {
    try {
      const user = await this.ensureAuthenticated();
      console.log('⚙️ 통계 설정 가져오기:', user.uid);
      
      const configRef = doc(db, 'statisticsConfigs', user.uid);
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        // 기본 설정 반환
        const defaultConfig = {
          userId: user.uid,
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
          }
        };
        
        return { config: defaultConfig };
      }
      
      const config = {
        id: configDoc.id,
        ...configDoc.data(),
        createdAt: this.formatTimestamp(configDoc.data().createdAt),
        updatedAt: this.formatTimestamp(configDoc.data().updatedAt)
      };
      
      console.log('✅ 통계 설정 가져오기 성공');
      return { config };
    } catch (error: any) {
      console.error('❌ 통계 설정 가져오기 실패:', error);
      throw new Error(error.message || '통계 설정을 가져오는데 실패했습니다.');
    }
  }

  async updateStatisticsConfig(configData: any) {
    try {
      const user = await this.ensureAuthenticated();
      console.log('⚙️ 통계 설정 업데이트:', user.uid);
      
      const updateData = {
        ...configData,
        userId: user.uid,
        updatedAt: Timestamp.now()
      };
      
      const configRef = doc(db, 'statisticsConfigs', user.uid);
      await setDoc(configRef, updateData, { merge: true });
      
      console.log('✅ 통계 설정 업데이트 성공');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 통계 설정 업데이트 실패:', error);
      return { success: false, error };
    }
  }
}

// 싱글톤 인스턴스
export const firebaseApiService = new FirebaseApiService();