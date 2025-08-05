import React, { useState, useEffect } from 'react';
import { checkFirebaseConnection, checkAuthStatus } from '../utils/firebase/config';
import { auth, db } from '../utils/firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from './GlassCard';
import { WaveButton } from './WaveButton';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Shield,
  User,
  Settings
} from 'lucide-react';

export default function FirebaseDebugger() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError(null);

    try {
      // Firebase 연결 확인
      const isConnected = await checkFirebaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');

      // 인증 상태 확인
      const authResult = await checkAuthStatus();
      setAuthStatus(authResult);

      // Firebase 설정 정보
      setFirebaseConfig({
        hasAuth: !!auth,
        hasDb: !!db,
        authDomain: auth?.config?.authDomain,
        projectId: db?._settings?.projectId
      });

    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message);
    }
  };

  const getStatusIcon = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'checking':
        return '연결 확인 중...';
      case 'connected':
        return '연결됨';
      case 'error':
        return '연결 실패';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <GlassCard variant="strong" className="p-4 w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Firebase 디버거</h3>
          <WaveButton
            variant="secondary"
            size="sm"
            onClick={checkConnection}
            disabled={connectionStatus === 'checking'}
          >
            <RefreshCw className="w-4 h-4" />
          </WaveButton>
        </div>

        {/* 연결 상태 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">Firebase 연결:</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon(connectionStatus)}
              <span className="text-sm text-white">{getStatusText(connectionStatus)}</span>
            </div>
          </div>

          {/* 인증 상태 */}
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">인증 상태:</span>
            <div className="flex items-center space-x-1">
              {isAuthenticated ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-white">
                {isAuthenticated ? '인증됨' : '인증되지 않음'}
              </span>
            </div>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">사용자:</span>
              <span className="text-sm text-white/80">{user.email}</span>
            </div>
          )}

          {/* Firebase 설정 */}
          {firebaseConfig && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white">설정:</span>
              </div>
              <div className="ml-6 space-y-1 text-xs text-white/70">
                <div>Auth: {firebaseConfig.hasAuth ? '✅' : '❌'}</div>
                <div>Database: {firebaseConfig.hasDb ? '✅' : '❌'}</div>
                <div>Domain: {firebaseConfig.authDomain || 'N/A'}</div>
                <div>Project: {firebaseConfig.projectId || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-start space-x-2 p-2 bg-red-500/20 border border-red-500/30 rounded">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}