import { useState } from 'react';
import { supabase, checkSupabaseConnection, checkAuthStatus } from '../utils/supabase/client';
import { apiService } from '../utils/api';
import { useApp } from '../App';

export const DataLoadingDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useApp();

  const runDebugTests = async () => {
    setIsLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      userInfo: {},
      authStatus: {},
      directSupabaseQuery: {},
      apiServiceQuery: {},
      environmentCheck: {},
      errors: []
    };

    try {
      // 1. 환경 변수 확인
      results.environmentCheck = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '설정됨' : '설정되지 않음',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음',
        VITE_APP_URL: import.meta.env.VITE_APP_URL,
        currentDomain: window.location.origin
      };

      // 2. Check user info
      results.userInfo = {
        user,
        hasUser: !!user,
        userId: user?.id
      };

      // 3. Check auth status
      const authStatus = await checkAuthStatus();
      results.authStatus = {
        isAuthenticated: authStatus.isAuthenticated,
        user: authStatus.user,
        error: authStatus.error?.message,
        hasAccessToken: !!authStatus.accessToken
      };

      // 4. Test Supabase connection
      try {
        const isConnected = await checkSupabaseConnection();
        results.supabaseConnection = {
          success: isConnected,
          error: null
        };
      } catch (error: any) {
        results.supabaseConnection = {
          success: false,
          error: error.message
        };
        results.errors.push(`Supabase 연결 실패: ${error.message}`);
      }

      // 5. Test direct Supabase query
      try {
        const { data: directData, error: directError } = await supabase
          .from('subscriptions')
          .select('*')
          .limit(5);
        
        results.directSupabaseQuery = {
          success: !directError,
          error: directError?.message,
          dataCount: directData?.length || 0,
          firstItem: directData?.[0] ? {
            id: directData[0].id,
            service_name: directData[0].service_name,
            user_id: directData[0].user_id
          } : null
        };
      } catch (error: any) {
        results.directSupabaseQuery = {
          success: false,
          error: error.message
        };
        results.errors.push(`Direct Supabase query failed: ${error.message}`);
      }

      // 6. Test API service query
      try {
        const apiData = await apiService.getSubscriptions();
        results.apiServiceQuery = {
          success: true,
          dataCount: apiData.subscriptions?.length || 0,
          firstItem: apiData.subscriptions?.[0] ? {
            id: apiData.subscriptions[0].id,
            serviceName: apiData.subscriptions[0].serviceName,
            amount: apiData.subscriptions[0].amount
          } : null
        };
      } catch (error: any) {
        results.apiServiceQuery = {
          success: false,
          error: error.message
        };
        results.errors.push(`API service query failed: ${error.message}`);
      }

      // 7. Check if access token is set
      try {
        if (authStatus.accessToken) {
          apiService.setAccessToken(authStatus.accessToken);
          results.accessTokenSet = true;
        } else {
          results.accessTokenSet = false;
          results.errors.push('No access token available');
        }
      } catch (error: any) {
        results.errors.push(`Access token setting failed: ${error.message}`);
      }

    } catch (error: any) {
      results.errors.push(`General error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setDebugInfo(results);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">데이터 로딩 디버거</h2>
      
      <button
        onClick={runDebugTests}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '진단 중...' : '진단 실행'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">진단 결과</h3>
          
          {/* 환경 변수 확인 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">환경 변수</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.environmentCheck, null, 2)}
            </pre>
          </div>

          {/* 사용자 정보 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">사용자 정보</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.userInfo, null, 2)}
            </pre>
          </div>

          {/* 인증 상태 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">인증 상태</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.authStatus, null, 2)}
            </pre>
          </div>

          {/* Supabase 연결 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">Supabase 연결</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.supabaseConnection, null, 2)}
            </pre>
          </div>

          {/* 직접 쿼리 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">직접 Supabase 쿼리</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.directSupabaseQuery, null, 2)}
            </pre>
          </div>

          {/* API 서비스 쿼리 */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">API 서비스 쿼리</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.apiServiceQuery, null, 2)}
            </pre>
          </div>

          {/* 에러 목록 */}
          {debugInfo.errors && debugInfo.errors.length > 0 && (
            <div className="border rounded p-4 border-red-300 bg-red-50">
              <h4 className="font-semibold mb-2 text-red-700">에러 목록</h4>
              <ul className="list-disc list-inside text-red-700">
                {debugInfo.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};