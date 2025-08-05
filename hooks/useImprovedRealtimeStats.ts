// 개선된 실시간 통계 훅

import { useMemo, useCallback, useState } from 'react';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { calculateRealtimeStats } from '../utils/statisticsCalculator';
import { 
  RealtimeStats, 
  StatisticsError, 
  StatisticsOptions,
  UseStatisticsReturn 
} from '../types/statistics';

export const useImprovedRealtimeStats = (
  options: StatisticsOptions = {}
): UseStatisticsReturn => {
  const { subscriptions, loading, error: subscriptionError, refresh: refreshSubscriptions } = useRealtimeSubscriptions();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [exportInProgress, setExportInProgress] = useState(false);

  // 통계 계산
  const { stats, errors } = useMemo(() => {
    console.log('📊 통계 재계산 시작:', {
      subscriptionsCount: subscriptions?.length || 0,
      hasOptions: Object.keys(options).length > 0
    });

    if (!subscriptions || subscriptions.length === 0) {
      return {
        stats: null,
        errors: []
      };
    }

    const result = calculateRealtimeStats(subscriptions, options);
    
    if (result.errors.length > 0) {
      console.warn('📊 통계 계산 경고:', result.errors);
    }

    return result;
  }, [subscriptions, options]);

  // 에러 통합
  const combinedError = useMemo(() => {
    if (subscriptionError) {
      return {
        code: 'SUBSCRIPTION_ERROR',
        message: subscriptionError.message,
        timestamp: new Date()
      } as StatisticsError;
    }
    
    if (errors.length > 0) {
      return errors[0]; // 첫 번째 에러 반환
    }
    
    return null;
  }, [subscriptionError, errors]);

  // 새로고침 함수
  const refresh = useCallback(async () => {
    try {
      console.log('📊 통계 새로고침 시작');
      await refreshSubscriptions();
      setLastRefresh(new Date());
      console.log('✅ 통계 새로고침 완료');
    } catch (error) {
      console.error('❌ 통계 새로고침 실패:', error);
      throw error;
    }
  }, [refreshSubscriptions]);

  // 데이터 내보내기 함수
  const exportData = useCallback(async (format: 'json' | 'csv' | 'xlsx'): Promise<string> => {
    if (!stats) {
      throw new Error('내보낼 통계 데이터가 없습니다');
    }

    setExportInProgress(true);
    
    try {
      console.log(`📤 통계 데이터 내보내기 시작: ${format}`);
      
      switch (format) {
        case 'json':
          return JSON.stringify({
            exportDate: new Date().toISOString(),
            statistics: stats,
            subscriptions: subscriptions,
            metadata: {
              version: '1.0',
              totalRecords: subscriptions?.length || 0
            }
          }, null, 2);
          
        case 'csv':
          return generateCsvExport(stats, subscriptions || []);
          
        case 'xlsx':
          // XLSX 내보내기는 추후 구현
          throw new Error('XLSX 형식은 아직 지원되지 않습니다');
          
        default:
          throw new Error(`지원되지 않는 형식: ${format}`);
      }
    } finally {
      setExportInProgress(false);
    }
  }, [stats, subscriptions]);

  // 설정 업데이트 (추후 구현)
  const updateConfig = useCallback((config: any) => {
    console.log('⚙️ 통계 설정 업데이트:', config);
    // 설정 업데이트 로직은 추후 구현
  }, []);

  return {
    stats,
    loading: loading || exportInProgress,
    error: combinedError,
    lastUpdated: lastRefresh,
    refresh,
    exportData,
    updateConfig
  };
};

// CSV 내보내기 헬퍼 함수
function generateCsvExport(stats: RealtimeStats, subscriptions: any[]): string {
  const headers = [
    '서비스명',
    '카테고리',
    '월별금액(원)',
    '연별금액(원)',
    '결제주기',
    '통화',
    '상태',
    '자동갱신',
    '결제일'
  ];

  const rows = subscriptions.map(sub => [
    sub.serviceName || '',
    sub.category || '',
    sub.paymentCycle === 'monthly' ? sub.amount : Math.round(sub.amount / 12),
    sub.paymentCycle === 'yearly' ? sub.amount : sub.amount * 12,
    sub.paymentCycle || '',
    sub.currency || '',
    sub.status || '',
    sub.autoRenewal ? '예' : '아니오',
    sub.paymentDay || ''
  ]);

  // 요약 정보 추가
  const summary = [
    [''],
    ['=== 통계 요약 ==='],
    ['총 구독 수', stats.totalSubscriptions],
    ['활성 구독 수', stats.activeSubscriptions],
    ['월별 총 금액', `${stats.totalMonthlyKrw.toLocaleString()}원`],
    ['연별 총 금액', `${stats.totalYearlyKrw.toLocaleString()}원`],
    ['평균 구독 비용', `${stats.avgSubscriptionCost.toLocaleString()}원`],
    [''],
    ['=== 카테고리별 통계 ==='],
    ...Object.entries(stats.categoryBreakdown).map(([category, data]) => [
      category,
      `${data.count}개`,
      `${data.monthlyAmount.toLocaleString()}원`,
      `${data.percentage || 0}%`
    ])
  ];

  const allRows = [
    headers,
    ...rows,
    ...summary
  ];

  return allRows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
}

// 레거시 호환성을 위한 별칭
export const useRealtimeStats = useImprovedRealtimeStats;