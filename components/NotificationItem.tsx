import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { 
  Check, 
  CreditCard,
  DollarSign,
  Clock,
  Eye,
  Trash2,
  Bell,
  Info,
  AlertTriangle
} from 'lucide-react';
import { getPhaseColors, PhaseType } from '../utils/phaseColors';
import { cn } from './ui/utils';
import { NotificationUI } from '../types/notifications';

interface NotificationItemProps {
  notification: NotificationUI;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  formatCurrency: (amount: number, currency: 'KRW' | 'USD') => string;
  formatRelativeTime: (dateString: string) => string;
}

export const NotificationItem = memo<NotificationItemProps>(({
  notification,
  isSelected,
  onToggleSelection,
  onMarkAsRead,
  onDelete,
  formatCurrency,
  formatRelativeTime
}) => {
  const getNotificationIcon = (type: string, priority: string) => {
    if (type === 'payment') {
      return priority === 'high' ? AlertTriangle : CreditCard;
    }
    return type === 'system' ? Info : Bell;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (type === 'payment') {
      switch (priority) {
        case 'high': return 'text-error-400';
        case 'medium': return 'text-warning-400';
        default: return 'text-white';
      }
    }
    return 'text-info-400';
  };

  const getNotificationBgColor = (type: string, priority: string) => {
    if (type === 'payment') {
      switch (priority) {
        case 'high': return 'bg-error-500/20';
        case 'medium': return 'bg-warning-500/20';
        default: return 'bg-success-500/20';
      }
    }
    return 'bg-info-500/20';
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-500/20 text-error-300 border-error-500/30';
      case 'medium':
        return 'bg-warning-500/20 text-warning-300 border-warning-500/30';
      default:
        return 'bg-info-500/20 text-info-300 border-info-500/30';
    }
  };

  const getCategoryPhase = (category: string): PhaseType => {
    const categoryPhaseMap: Record<string, PhaseType> = {
      '엔터테인먼트': 'shine',
      '음악': 'growth',
      '개발': 'challenge',
      'AI': 'challenge',
      '디자인': 'growth',
      '생산성': 'beginning',
      '교육': 'beginning',
      '피트니스': 'challenge',
      '뉴스': 'beginning',
      '게임': 'shine',
      '기타': 'beginning'
    };
    return categoryPhaseMap[category] || 'beginning';
  };

  const IconComponent = getNotificationIcon(notification.type, notification.priority);
  const iconColor = getNotificationColor(notification.type, notification.priority);
  const bgColor = getNotificationBgColor(notification.type, notification.priority);
  const phaseColors = notification.category ? getPhaseColors(getCategoryPhase(notification.category)) : null;

  return (
    <GlassCard 
      variant={notification.isRead ? "light" : "strong"}
      className={cn(
        "transition-all duration-200 hover:border-white/30 hover:bg-white/5 touch-target",
        !notification.isRead && "ring-1 ring-primary-500/30",
        isSelected && "ring-2 ring-primary-500/50 bg-primary-500/10",
        notification.priority === 'high' && !notification.isRead && "shadow-lg shadow-error-500/20"
      )}
    >
      <div className="p-token-lg">
        <div className="flex items-start space-x-token-md">
          {/* Selection Checkbox */}
          <button
            onClick={() => onToggleSelection(notification.id)}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-1 touch-target-sm focus-ring",
              isSelected 
                ? "bg-primary-500 border-primary-500" 
                : "border-white/30 hover:border-white/50"
            )}
            aria-label={isSelected ? "선택 해제" : "선택"}
          >
            {isSelected && <Check size={12} className="text-white icon-enhanced" />}
          </button>

          {/* Icon */}
          <div className={cn(
            "p-token-sm rounded-lg flex-shrink-0",
            bgColor
          )}>
            <IconComponent size={20} className={cn(iconColor, "icon-enhanced")} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-token-sm">
              <div className="flex-1">
                <div className="flex items-center space-x-token-sm mb-1">
                  <h3 className={cn(
                    "font-medium text-lg-ko tracking-ko-normal break-keep-ko",
                    notification.isRead ? "text-white/80" : "text-white-force"
                  )}>
                    {notification.title}
                  </h3>
                  
                  {/* Category Phase Indicator */}
                  {phaseColors && (
                    <span className={cn("w-2 h-2 rounded-full", phaseColors.bg)}></span>
                  )}
                  
                  {/* Read Status */}
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                
                <p className={cn(
                  "text-sm-ko break-words tracking-ko-normal",
                  notification.isRead ? "text-white/50" : "text-white/70"
                )}>
                  {notification.message}
                </p>
              </div>

              {/* Priority Badge */}
              <span className={cn(
                "text-xs-ko px-2 py-1 rounded-full border ml-token-md flex-shrink-0 tracking-ko-normal",
                getPriorityBadgeClass(notification.priority)
              )}>
                {notification.priority === 'high' ? '높음' : 
                 notification.priority === 'medium' ? '보통' : '낮음'}
              </span>
            </div>

            {/* Enhanced Metadata */}
            {notification.metadata && (
              <div className="mb-token-sm p-token-sm bg-white/5 rounded-lg">
                <div className="flex items-center justify-between text-sm-ko">
                  {notification.metadata.amount && notification.metadata.currency && (
                    <div className="flex items-center space-x-token-xs text-white/60">
                      <DollarSign size={14} className="icon-enhanced" />
                      <span className="font-medium text-white-force tracking-ko-normal">
                        {formatCurrency(notification.metadata.amount, notification.metadata.currency)}
                      </span>
                      {notification.metadata.currency === 'USD' && (
                        <span className="text-xs-ko text-white/40 tracking-ko-normal">
                          (${notification.metadata.amount})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {notification.metadata.daysUntil !== undefined && (
                    <div className="flex items-center space-x-token-xs text-white/60">
                      <Clock size={14} className="icon-enhanced" />
                      <span className={cn(
                        "font-medium tracking-ko-normal",
                        notification.metadata.daysUntil === 0 ? "text-error-400" :
                        notification.metadata.daysUntil <= 3 ? "text-warning-400" : ""
                      )}>
                        {notification.metadata.daysUntil === 0 ? '오늘' : 
                         notification.metadata.daysUntil === 1 ? '내일' :
                         `${notification.metadata.daysUntil}일 후`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-token-sm text-xs-ko text-white/40 tracking-ko-normal">
                <span>{formatRelativeTime(notification.date)}</span>
                {notification.category && (
                  <>
                    <span>•</span>
                    <span className="break-keep-ko">{notification.category}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {!notification.isRead && (
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1.5 text-white hover:text-white/80 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                    ariaLabel="읽음 처리"
                  >
                    <Check size={14} className="icon-enhanced" />
                  </WaveButton>
                )}
                
                {notification.subscriptionId && (
                  <Link to={`/subscriptions/${notification.subscriptionId}`}>
                    <WaveButton
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                      ariaLabel="구독 상세보기"
                    >
                      <Eye size={14} className="icon-enhanced" />
                    </WaveButton>
                  </Link>
                )}
                
                <WaveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="p-1.5 text-white/40 hover:text-error-400 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                  ariaLabel="삭제"
                >
                  <Trash2 size={14} className="icon-enhanced" />
                </WaveButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.notification.id === nextProps.notification.id &&
    prevProps.notification.isRead === nextProps.notification.isRead &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.notification.title === nextProps.notification.title &&
    prevProps.notification.message === nextProps.notification.message &&
    JSON.stringify(prevProps.notification.metadata) === JSON.stringify(nextProps.notification.metadata)
  );
});

NotificationItem.displayName = 'NotificationItem';