import React, { useState, useEffect } from 'react';
import { Shield, User, Database, CheckCircle, XCircle, AlertTriangle, RotateCw, Play, FileText } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { 
  checkAuthenticationStatus, 
  testDataAccessAfterLogin, 
  testRLSPolicyComparison, 
  logSessionDetails 
} from '../utils/auth-test';

interface SessionInfo {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
  expiresAt?: number;
  accessToken?: string;
}

interface RLSTestResult {
  table: string;
  operation: string;
  success: boolean;
  error?: string;
  rowCount?: number;
}

export const RLSDebugger: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [rlsResults, setRlsResults] = useState<RLSTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      const result = await checkAuthenticationStatus();
      
      if (result.sessionData) {
        setSessionInfo({
          isAuthenticated: result.isAuthenticated,
          userId: result.sessionData.userId,
          email: result.sessionData.email,
          role: result.sessionData.role,
          expiresAt: result.sessionData.expiresAt,
          accessToken: result.sessionData.accessToken?.substring(0, 20) + '...'
        });
      } else {
        setSessionInfo({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setSessionInfo({ isAuthenticated: false });
    }
  };

  // RLS 정책 테스트
  const testRLSPolicies = async () => {
    setIsLoading(true);
    try {
      const result = await testRLSPolicyComparison();
      
      const formattedResults: RLSTestResult[] = result.results.map(r => ({
        table: r.table,
        operation: 'SELECT',
        success: r.success,
        error: r.error || undefined,
        rowCount: r.rowCount
      }));
      
      setRlsResults(formattedResults);
      setTestResults(result);
    } catch (error) {
      console.error('RLS 테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 후 데이터 접근 테스트
  const runPostLoginTest = async () => {
    setIsLoading(true);
    try {
      const result = await testDataAccessAfterLogin();
      setTestResults(result);
      
      if (result.results) {
        const formattedResults: RLSTestResult[] = result.results.map(r => ({
          table: r.table,
          operation: 'SELECT',
          success: r.success,
          error: r.error || undefined,
          rowCount: r.rowCount
        }));
        setRlsResults(formattedResults);
      }
    } catch (error) {
      console.error('로그인 후 테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 상세 로그 출력
  const showSessionDetails = async () => {
    await logSessionDetails();
    alert('세션 상세 정보가 콘솔에 출력되었습니다. 개발자 도구(F12)의 콘솔 탭을 확인하세요.');
  };

  // 세션 새로고침
  const refreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('세션 새로고침 실패:', error);
      } else {
        console.log('✅ 세션이 성공적으로 새로고침되었습니다');
        await checkAuthStatus();
      }
    } catch (error) {
      console.error('세션 새로고침 중 오류:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getStatusIcon = (success: boolean, error?: string) => {
    if (success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (error?.includes('Row Level Security policy')) {
      return <Shield className="w-5 h-5 text-orange-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusMessage = (success: boolean, error?: string) => {
    if (success) {
      return 'Success';
    } else if (error?.includes('Row Level Security policy')) {
      return 'RLS Policy Block (Expected for unauthenticated users)';
    } else {
      return 'Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              RLS (Row Level Security) 디버거
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={showSessionDetails}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 mr-1" />
                세션 상세
              </button>
              <button
                onClick={refreshSession}
                disabled={isRefreshing}
                className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                새로고침
              </button>
              <button
                onClick={checkAuthStatus}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <User className="w-4 h-4 mr-1" />
                인증 확인
              </button>
            </div>
          </div>

          {/* 인증 상태 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              인증 상태
            </h2>
            
            {sessionInfo ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  {sessionInfo.isAuthenticated ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">
                    {sessionInfo.isAuthenticated ? '로그인됨' : '로그아웃됨'}
                  </span>
                </div>
                
                {sessionInfo.isAuthenticated && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <strong>사용자 ID:</strong> {sessionInfo.userId}
                      </div>
                      <div>
                        <strong>이메일:</strong> {sessionInfo.email}
                      </div>
                      <div>
                        <strong>역할:</strong> {sessionInfo.role}
                      </div>
                      <div>
                        <strong>만료 시간:</strong> {
                          sessionInfo.expiresAt 
                            ? new Date(sessionInfo.expiresAt * 1000).toLocaleString()
                            : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="mt-2">
                      <strong>액세스 토큰:</strong> 
                      <code className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded">
                        {sessionInfo.accessToken}
                      </code>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-gray-500">인증 상태를 확인하는 중...</div>
            )}
          </div>

          {/* RLS 테스트 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Database className="w-5 h-5 mr-2" />
                RLS 정책 테스트
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={runPostLoginTest}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isLoading ? '테스트 중...' : '로그인 후 테스트'}
                </button>
                <button
                  onClick={testRLSPolicies}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Database className="w-4 h-4 mr-1" />
                  {isLoading ? '테스트 중...' : 'RLS 정책 테스트'}
                </button>
              </div>
            </div>

            {/* 테스트 결과 요약 */}
            {testResults && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">테스트 결과 요약</h3>
                <p className="text-sm text-blue-700">{testResults.message}</p>
                {testResults.summary && (
                  <div className="mt-2 text-sm text-blue-600">
                    총 {testResults.summary.total}개 테이블 | 
                    성공: {testResults.summary.successful}개 | 
                    RLS 차단: {testResults.summary.rlsBlocked}개 | 
                    오류: {testResults.summary.errors}개
                  </div>
                )}
              </div>
            )}

            {rlsResults.length > 0 && (
              <div className="space-y-3">
                {rlsResults.map((result, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(result.success, result.error)}
                        <span className="ml-2 font-medium">
                          {result.table}.{result.operation}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getStatusMessage(result.success, result.error)}
                      </span>
                    </div>
                    
                    {result.rowCount !== undefined && (
                      <div className="mt-2 text-sm text-gray-600">
                        조회된 행 수: {result.rowCount}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>오류:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {rlsResults.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 py-8">
                테스트 버튼을 클릭하여 RLS 정책을 확인하세요.
              </div>
            )}
          </div>
        </div>

        {/* 도움말 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            RLS 정책 이해하기
          </h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">✅ 정상적인 RLS 동작</h3>
              <p>
                미인증 사용자가 데이터에 접근할 때 "Row Level Security policy" 오류가 발생하는 것은 
                <strong> 정상적인 보안 설정</strong>입니다. 이는 데이터베이스가 올바르게 보호되고 있음을 의미합니다.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🔐 해결 방법</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>사용자가 로그인한 후 데이터에 접근해야 합니다.</li>
                <li>로그인 페이지(/login)에서 인증을 완료하세요.</li>
                <li>인증 후 이 페이지를 다시 방문하여 테스트하세요.</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🧪 테스트 방법</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>먼저 "인증 확인" 버튼을 클릭하여 현재 로그인 상태를 확인합니다.</li>
                <li>로그아웃 상태라면 /login 페이지에서 로그인하세요.</li>
                <li>로그인 후 다시 이 페이지로 돌아와서 "로그인 후 테스트"를 클릭합니다.</li>
                <li>인증된 사용자는 자신의 데이터에 접근할 수 있어야 합니다.</li>
                <li>"세션 상세" 버튼을 클릭하면 콘솔에서 더 자세한 정보를 확인할 수 있습니다.</li>
              </ol>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🎯 빠른 테스트</h3>
              <p className="mb-2">다음 코드를 브라우저 콘솔에서 직접 실행할 수 있습니다:</p>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                {`// 인증 상태 확인
const { data: { session } } = await supabase.auth.getSession();
console.log('세션 상태:', session ? '로그인됨' : '로그아웃됨');`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};