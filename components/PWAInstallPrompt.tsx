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
      e.preventDefault();
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
            icon: '/favicon.ico',
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
          icon: '/favicon.ico',
          requireInteraction: false
        });
      }
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // 이미 설치되었거나 프롬프트를 표시할 필요가 없으면 렌더링하지 않음
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle className="text-lg">앱 설치</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-white/90 mb-4">
            구독관리 앱을 홈 화면에 설치하여 더 빠르게 접근하세요.
          </CardDescription>
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-blue-600 hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-2" />
              설치하기
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-white/30 text-white hover:bg-white/10"
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