// 통합 알림 훅

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { notificationService } from '../utils/notificationService';
import { notificationMonitor } from '../utils/notificationMonitor';
import { 
  NotificationUI, 
  NotificationFilter, 
  NotificationStats,
  NotificationError,
  CreateNotificationRequest
} from '../types/notifications';

export interface UseNotificationsReturn {
  // 데이터
  notifications: NotificationUI[];
  filteredNotifications: NotificationUI[];
  stats: NotificationStats;
  
  // 상태
  loading: boolean;
  error: NotificationError | null;
  
  // 필터 및 선택
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  selectedNotifications: string[];
  setSelectedNotifications: (ids: string[]) => void;
  
  // 액션
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  deleteSelected: () => Promise<boolean>;
  markSelectedAsRead: () => Promise<boolean>;
  createNotification: (notification: CreateNotificationRequest) => Promise<boolean>;
  refresh: () => Promise<void>;
  
  // 선택 관리
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // 권한
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export const useNotifications = (
  initialFilter: NotificationFilter = { type: 'all', status: 'all' }
): UseNotificationsReturn => {
  const { user } = useAuth();
  const { subscriptions } = useData();
  
  // 상태
  const [notifications, setNotifications] = useState<NotificationUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NotificationError | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // 권한 확인 및 요청
  const checkNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }

    setHasPermission(false);
    return false;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return await checkNotificationPermission();
  }, [checkNotificationPermission]);

  // 초기 권한 확인
  useEffect(() => {
    checkNotificationPermission();
  }, [checkNotificationPermission]);

  // 알림 실시간 구독
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('🔔 알림 실시간 구독 시작:', user.uid);

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        console.log('📨 알림 업데이트 수신:', newNotifications.length);
        setNotifications(newNotifications);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      console.log('🔔 알림 실시간 구독 해제');
      unsubscribe();
    };
  }, [user?.uid]);

  // 구독 데이터 변경 시 모니터링 시스템에 알림
  useEffect(() => {
    if (!user?.uid || !subscriptions || subscriptions.length === 0) {
      return;
    }

    // 결제 예정일 확인
    notificationMonitor.checkPaymentDue(user.uid, subscriptions);
    
    // 만료 확인
    notificationMonitor.checkSubscriptionExpiry(user.uid, subscriptions);
  }, [user?.uid, subscriptions]);

  // 필터링된 알림 계산
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // 타입 필터
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    // 상태 필터
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(n => 
        filter.status === 'read' ? n.isRead : !n.isRead
      );
    }

    // 우선순위 필터
    if (filter.priority && filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    // 날짜 범위 필터
    if (filter.dateRange) {
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.date);
        return notificationDate >= filter.dateRange!.start && 
               notificationDate <= filter.dateRange!.end;
      });
    }

    // 구독 ID 필터
    if (filter.subscriptionId) {
      filtered = filtered.filter(n => n.subscriptionId === filter.subscriptionId);
    }

    // 카테고리 필터
    if (filter.category) {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    return filtered;
  }, [notifications, filter]);

  // 통계 계산
  const stats = useMemo((): NotificationStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType: {
        payment: notifications.filter(n => n.type === 'payment').length,
        renewal: notifications.filter(n => n.type === 'renewal').length,
        expiry: notifications.filter(n => n.type === 'expiry').length,
        system: notifications.filter(n => n.type === 'system').length,
        warning: notifications.filter(n => n.type === 'warning').length,
        info: notifications.filter(n => n.type === 'info').length
      },
      byPriority: {
        low: notifications.filter(n => n.priority === 'low').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        high: notifications.filter(n => n.priority === 'high').length,
        urgent: notifications.filter(n => n.priority === 'urgent').length
      },
      todayCount: notifications.filter(n => new Date(n.date) >= today).length,
      weekCount: notifications.filter(n => new Date(n.date) >= weekAgo).length,
      monthCount: notifications.filter(n => new Date(n.date) >= monthAgo).length
    };
  }, [notifications]);

  // 액션 함수들
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await notificationService.markAsRead(id);
      if (result.success) {
        console.log('✅ 알림 읽음 처리 성공:', id);
        return true;
      } else {
        setError(result.error || null);
        console.error('❌ 알림 읽음 처리 실패:', result.error);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '알림 읽음 처리 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const results = await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
      
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        console.log('✅ 모든 알림 읽음 처리 성공');
        return true;
      } else {
        const firstError = results.find(r => !r.success)?.error;
        setError(firstError || null);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '모든 알림 읽음 처리 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await notificationService.deleteNotification(id);
      if (result.success) {
        console.log('✅ 알림 삭제 성공:', id);
        return true;
      } else {
        setError(result.error || null);
        console.error('❌ 알림 삭제 실패:', result.error);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '알림 삭제 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, []);

  const deleteSelected = useCallback(async (): Promise<boolean> => {
    try {
      const results = await Promise.all(
        selectedNotifications.map(id => notificationService.deleteNotification(id))
      );
      
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        setSelectedNotifications([]);
        console.log('✅ 선택된 알림 삭제 성공');
        return true;
      } else {
        const firstError = results.find(r => !r.success)?.error;
        setError(firstError || null);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '선택된 알림 삭제 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, [selectedNotifications]);

  const markSelectedAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const results = await Promise.all(
        selectedNotifications.map(id => notificationService.markAsRead(id))
      );
      
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        setSelectedNotifications([]);
        console.log('✅ 선택된 알림 읽음 처리 성공');
        return true;
      } else {
        const firstError = results.find(r => !r.success)?.error;
        setError(firstError || null);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '선택된 알림 읽음 처리 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, [selectedNotifications]);

  const createNotification = useCallback(async (notification: CreateNotificationRequest): Promise<boolean> => {
    try {
      const result = await notificationService.createNotification(notification);
      if (result.success) {
        console.log('✅ 알림 생성 성공:', result.data);
        return true;
      } else {
        setError(result.error || null);
        console.error('❌ 알림 생성 실패:', result.error);
        return false;
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '알림 생성 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
      return false;
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await notificationService.getNotifications(user.uid, filter);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError(result.error || null);
      }
    } catch (error: any) {
      const notificationError: NotificationError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || '알림 새로고침 중 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setError(notificationError);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, filter]);

  // 선택 관리 함수들
  const toggleSelection = useCallback((id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  }, [filteredNotifications]);

  const clearSelection = useCallback(() => {
    setSelectedNotifications([]);
  }, []);

  // 에러 자동 클리어
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000); // 10초 후 에러 클리어

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // 데이터
    notifications,
    filteredNotifications,
    stats,
    
    // 상태
    loading,
    error,
    
    // 필터 및 선택
    filter,
    setFilter,
    selectedNotifications,
    setSelectedNotifications,
    
    // 액션
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelected,
    markSelectedAsRead,
    createNotification,
    refresh,
    
    // 선택 관리
    toggleSelection,
    selectAll,
    clearSelection,
    
    // 권한
    hasPermission,
    requestPermission
  };
};