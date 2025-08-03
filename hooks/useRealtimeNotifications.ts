import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from './useFirestore';
import { where, orderBy, limit } from '../utils/firebase/client';
import { Notification } from '../contexts/DataContext';

interface RealtimeNotificationsHook {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export const useRealtimeNotifications = (limitCount: number = 50): RealtimeNotificationsHook => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Firestore 실시간 구독 - 최신 알림들만 가져오기
  const { data: notifications, loading, error } = useCollection<Notification>(
    'notifications',
    user ? [
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ] : []
  );

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  // 수동 새로고침 함수
  const refresh = () => {
    console.log('🔄 알림 데이터 새로고침');
    setRefreshTrigger(prev => prev + 1);
  };

  // 사용자 변경 시 자동 새로고침
  useEffect(() => {
    if (user) {
      console.log('👤 사용자 변경됨, 알림 데이터 새로고침');
      refresh();
    }
  }, [user?.uid]);

  // 알림 변경 로깅
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      console.log('🔔 알림 데이터 업데이트됨:', {
        total: notifications.length,
        unread: unreadCount,
        types: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    }
  }, [notifications, unreadCount]);

  // 새로운 알림이 있을 때 사용자에게 알림 (브라우저 알림)
  useEffect(() => {
    if (notifications && notifications.length > 0 && unreadCount > 0) {
      const latestUnread = notifications.find(n => !n.isRead);
      if (latestUnread && 'Notification' in window) {
        // 브라우저 알림 권한 확인
        if (Notification.permission === 'granted') {
          new Notification(latestUnread.title, {
            body: latestUnread.message,
            icon: '/favicon.ico',
            tag: latestUnread.id
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(latestUnread.title, {
                body: latestUnread.message,
                icon: '/favicon.ico',
                tag: latestUnread.id
              });
            }
          });
        }
      }
    }
  }, [notifications, unreadCount]);

  return {
    notifications: notifications || [],
    unreadCount,
    loading,
    error,
    refresh
  };
};