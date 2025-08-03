import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // 초기 확인
    if (checkIfInstalled()) return;

    // 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      // preventDefault() 제거 - 브라우저의 기본 설치 배너가 표시되도록 함
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // 앱 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // display-mode 변경 감지
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('사용자가 앱 설치를 수락했습니다');
        setIsInstalled(true);
        setShowInstallPrompt(false);
        
        // 설치 성공 알림
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('앱 설치 완료', {
            body: '구독관리 앱이 성공적으로 설치되었습니다.',
            icon: '/Moonwave_2.png',
            requireInteraction: false
          });
        }
      } else {
        console.log('사용자가 앱 설치를 거부했습니다');
      }
    } catch (error) {
      console.error('설치 프롬프트 오류:', error);
      
      // 에러 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('설치 오류', {
          body: '앱 설치 중 오류가 발생했습니다. 다시 시도해주세요.',
          icon: '/Moonwave_2.png',
          requireInteraction: false
        });
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // 이미 설치되어 있거나 프롬프트를 표시하지 않을 경우 렌더링하지 않음
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              앱 설치
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-background/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            더 나은 경험을 위해 앱을 설치해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4 text-primary" />
            <span>홈 화면에 바로가기 추가</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <Download className="h-4 w-4 text-primary" />
            <span>오프라인에서도 사용 가능</span>
          </div>
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              설치하기
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              나중에
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt; 