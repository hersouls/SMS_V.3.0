import React, { useState, useRef, useEffect } from 'react';

interface TestResult {
  testName: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export const SupabaseTestDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 로그 자동 스크롤
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 콘솔 로그를 캡처하여 UI에 표시
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    const logEntry = `[${timestamp}] ${emoji} ${message}`;
    
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('로그가 지워졌습니다.', 'info');
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsRunning(true);
    addLog(`${testName} 시작...`, 'info');
    
    try {
      const result = await testFunction();
      addLog(`${testName} 완료`, 'success');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`${testName} 실패: ${errorMessage}`, 'error');
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    addLog('🚀 전체 Supabase 테스트 시작', 'info');
    
    try {
      // TODO: supabase-manual-test 파일이 없어서 임시로 주석 처리
      addLog('테스트 함수들이 아직 구현되지 않았습니다.', 'info');
      setTestResults([]);
      
    } catch (error) {
      addLog('전체 테스트 실행 중 오류 발생', 'error');
      setConnectionStatus('disconnected');
    } finally {
      setIsRunning(false);
    }
  };

  const handleEnvironmentTest = async () => {
    addLog('환경 설정 테스트: 아직 구현되지 않음', 'info');
  };

  const handleConnectionTest = async () => {
    addLog('연결 테스트: 아직 구현되지 않음', 'info');
  };

  const handleAuthTest = async () => {
    addLog('인증 테스트: 아직 구현되지 않음', 'info');
  };

  const handleDatabaseTest = async () => {
    addLog('데이터베이스 스키마 테스트: 아직 구현되지 않음', 'info');
  };

  const handleCRUDTest = async () => {
    addLog('CRUD 테스트: 아직 구현되지 않음', 'info');
  };

  const handleRealtimeTest = async () => {
    addLog('Real-time 테스트: 아직 구현되지 않음', 'info');
  };

  const handleStorageTest = async () => {
    addLog('스토리지 테스트: 아직 구현되지 않음', 'info');
  };

  const handleAuthOnlyTests = async () => {
    setIsRunning(true);
    addLog('🔐 인증 관련 테스트만 실행', 'info');
    
    try {
      addLog('인증 테스트: 아직 구현되지 않음', 'info');
      setTestResults([]);
    } catch (error) {
      addLog('인증 테스트 실행 중 오류 발생', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDatabaseOnlyTests = async () => {
    setIsRunning(true);
    addLog('📊 데이터베이스 관련 테스트만 실행', 'info');
    
    try {
      addLog('데이터베이스 테스트: 아직 구현되지 않음', 'info');
      setTestResults([]);
    } catch (error) {
      addLog('데이터베이스 테스트 실행 중 오류 발생', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Supabase 연결됨';
      case 'disconnected': return 'Supabase 연결 안됨';
      default: return '연결 상태 확인 중';
    }
  };

  // 초기 로그
  useEffect(() => {
    addLog('Supabase 테스트 대시보드가 준비되었습니다.', 'info');
    addLog('원하는 테스트를 선택하여 실행하세요.', 'info');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Supabase 연동 테스트 대시보드
            </h1>
            <p className="text-gray-600">
              Supabase 데이터베이스, 인증, Real-time 등 모든 기능을 종합적으로 테스트할 수 있습니다.
            </p>
          </div>

          {/* 상태 표시 */}
          <div className="mb-6 flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <span className="font-medium">{getStatusText()}</span>
            </div>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* 테스트 버튼들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleRunAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isRunning ? '실행 중...' : '🧪 전체 테스트'}
            </button>

            <button
              onClick={handleEnvironmentTest}
              disabled={isRunning}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🔧 환경 설정
            </button>

            <button
              onClick={handleConnectionTest}
              disabled={isRunning}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🌐 연결 테스트
            </button>

            <button
              onClick={handleAuthTest}
              disabled={isRunning}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🔐 인증 테스트
            </button>

            <button
              onClick={handleDatabaseTest}
              disabled={isRunning}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📊 데이터베이스
            </button>

            <button
              onClick={handleCRUDTest}
              disabled={isRunning}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📝 CRUD 테스트
            </button>

            <button
              onClick={handleRealtimeTest}
              disabled={isRunning}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              ⚡ Real-time
            </button>

            <button
              onClick={handleStorageTest}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📁 스토리지
            </button>
          </div>

          {/* 그룹 테스트 버튼들 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAuthOnlyTests}
              disabled={isRunning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🔐 인증만 테스트
            </button>

            <button
              onClick={handleDatabaseOnlyTests}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📊 DB만 테스트
            </button>

            <button
              onClick={clearLogs}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🗑️ 로그 지우기
            </button>
          </div>

          {/* 테스트 결과 요약 */}
          {testResults.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">📋 테스트 결과 요약</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">성공</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">실패</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.length > 0 ? ((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">성공률</div>
                </div>
              </div>
            </div>
          )}

          {/* 로그 콘솔 */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="mb-2 text-gray-400">콘솔 로그:</div>
            <div className="h-96 overflow-y-auto space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* 사용법 안내 */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 사용법</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• <strong>전체 테스트</strong>: 모든 Supabase 기능을 순차적으로 테스트합니다.</li>
              <li>• <strong>개별 테스트</strong>: 특정 기능만 확인하고 싶을 때 사용하세요.</li>
              <li>• <strong>CRUD 테스트</strong>: 로그인이 필요하며, 실제 데이터를 생성/수정/삭제합니다.</li>
              <li>• <strong>Real-time 테스트</strong>: 5초간 실시간 이벤트를 모니터링합니다.</li>
              <li>• 브라우저 개발자 도구(F12) 콘솔에서도 상세한 로그를 확인할 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};