// Firebase 인덱스 오류 안내 컴포넌트

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Info,
  CheckCircle,
  Copy,
  Database
} from 'lucide-react';
import { cn } from './ui/utils';

interface FirebaseIndexErrorProps {
  error: any;
  onRetry?: () => void;
  className?: string;
}

export const FirebaseIndexError: React.FC<FirebaseIndexErrorProps> = ({
  error,
  onRetry,
  className
}) => {
  const [copied, setCopied] = useState(false);
  
  // 인덱스 오류인지 확인
  const isIndexError = error?.code === 'failed-precondition' || 
                       error?.message?.includes('index') ||
                       error?.message?.includes('requires an index');
  
  // 오류 메시지에서 인덱스 URL 추출
  const extractIndexUrl = (message: string): string | null => {
    const urlMatch = message?.match(/https:\/\/console\.firebase\.google\.com[^\s)]+/);
    return urlMatch ? urlMatch[0] : null;
  };
  
  const indexUrl = error?.message ? extractIndexUrl(error.message) : null;
  
  // URL 복사 함수
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  if (!isIndexError) {
    return null; // 인덱스 오류가 아니면 표시하지 않음
  }

  return (
    <GlassCard variant="strong" className={cn("p-token-lg", className)}>
      <div className="space-y-token-lg">
        {/* 헤더 */}
        <div className="flex items-start space-x-token-md">
          <div className="p-token-sm bg-warning-500/20 rounded-lg flex-shrink-0">
            <Database size={24} className="text-warning-400 icon-enhanced" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl-ko font-semibold text-white-force mb-token-xs tracking-ko-normal break-keep-ko">
              Firebase 데이터베이스 인덱스 필요
            </h3>
            <p className="text-base-ko text-white/70 tracking-ko-normal break-keep-ko">
              구독 데이터를 효율적으로 조회하기 위해 데이터베이스 인덱스가 필요합니다.
            </p>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="space-y-token-md">
          <div className="flex items-start space-x-token-sm">
            <Info size={16} className="text-info-400 mt-0.5 flex-shrink-0 icon-enhanced" />
            <div className="space-y-token-xs">
              <p className="text-sm-ko text-white/80 tracking-ko-normal break-keep-ko">
                <strong className="text-white-force">원인:</strong> 
                사용자별 구독 데이터를 날짜순으로 정렬하여 조회하는 기능에 복합 인덱스가 필요합니다.
              </p>
              <p className="text-sm-ko text-white/80 tracking-ko-normal break-keep-ko">
                <strong className="text-white-force">영향:</strong> 
                구독 목록 조회가 제한적으로 작동할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 해결 방법 */}
        <div className="space-y-token-md">
          <h4 className="text-lg-ko font-medium text-white-force tracking-ko-normal break-keep-ko">
            🛠️ 해결 방법
          </h4>
          
          <div className="space-y-token-sm">
            <div className="p-token-md bg-info-500/10 border border-info-500/20 rounded-lg">
              <div className="flex items-start space-x-token-sm">
                <CheckCircle size={16} className="text-info-400 mt-0.5 flex-shrink-0 icon-enhanced" />
                <div className="space-y-token-xs">
                  <p className="text-sm-ko font-medium text-white-force tracking-ko-normal break-keep-ko">
                    1. 자동 인덱스 생성 (권장)
                  </p>
                  <p className="text-xs-ko text-white/70 tracking-ko-normal break-keep-ko">
                    Firebase가 제공하는 링크를 클릭하여 자동으로 인덱스를 생성합니다.
                  </p>
                </div>
              </div>
            </div>

            {indexUrl && (
              <div className="space-y-token-sm">
                <div className="flex items-center space-x-token-sm">
                  <WaveButton
                    variant="primary"
                    size="sm"
                    onClick={() => window.open(indexUrl, '_blank')}
                    className="shadow-lg shadow-primary-500/20 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 text-white touch-target focus-ring"
                  >
                    <ExternalLink size={14} className="mr-token-xs icon-enhanced text-white" />
                    <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">
                      Firebase Console에서 인덱스 생성
                    </span>
                  </WaveButton>
                  
                  <WaveButton
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(indexUrl)}
                    className="text-white hover:text-white/80 hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
                  >
                    {copied ? (
                      <CheckCircle size={14} className="text-success-400 icon-enhanced" />
                    ) : (
                      <Copy size={14} className="icon-enhanced text-white" />
                    )}
                  </WaveButton>
                </div>
                
                <div className="p-token-sm bg-white/5 rounded border text-xs-ko font-mono text-white/60 break-all">
                  {indexUrl}
                </div>
              </div>
            )}

            <div className="p-token-md bg-success-500/10 border border-success-500/20 rounded-lg">
              <div className="flex items-start space-x-token-sm">
                <CheckCircle size={16} className="text-success-400 mt-0.5 flex-shrink-0 icon-enhanced" />
                <div className="space-y-token-xs">
                  <p className="text-sm-ko font-medium text-white-force tracking-ko-normal break-keep-ko">
                    2. 인덱스 생성 완료 후
                  </p>
                  <p className="text-xs-ko text-white/70 tracking-ko-normal break-keep-ko">
                    인덱스 생성에는 5-10분 정도 소요될 수 있습니다. 
                    완료 후 페이지를 새로고침하거나 아래 버튼을 클릭하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-token-md border-t border-white/10">
          <div className="text-xs-ko text-white/50 tracking-ko-normal break-keep-ko">
            이 문제는 일회성이며, 인덱스 생성 후 재발하지 않습니다.
          </div>
          
          {onRetry && (
            <WaveButton
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="hover:bg-white/30 active:scale-95 focus:ring-2 focus:ring-white/50 transition-all duration-200 touch-target-sm focus-ring"
            >
              <RefreshCw size={14} className="mr-token-xs icon-enhanced text-white" />
              <span className="text-sm-ko font-medium text-white-force tracking-ko-normal">다시 시도</span>
            </WaveButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
};