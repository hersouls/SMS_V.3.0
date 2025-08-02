import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
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
      errors: []
    };

    try {
      // 1. Check user info
      results.userInfo = {
        user,
        hasUser: !!user,
        userId: user?.id
      };

      // 2. Check auth status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.authStatus = {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'present' : 'missing',
        expiresAt: session?.expires_at,
        currentTime: Math.floor(Date.now() / 1000)
      };

      // 3. Test direct Supabase query
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

      // 4. Test API service query
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

      // 5. Check if access token is set
      try {
        if (session?.access_token) {
          apiService.setAccessToken(session.access_token);
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
    }

    setDebugInfo(results);
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p>사용자가 로그인되지 않았습니다. 먼저 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">데이터 로딩 디버거</h2>
      
      <button
        onClick={runDebugTests}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '디버깅 중...' : '디버그 테스트 실행'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">디버그 결과:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          {debugInfo.errors && debugInfo.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <h4 className="font-semibold text-red-800">발견된 오류:</h4>
              <ul className="list-disc list-inside text-red-700">
                {debugInfo.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {debugInfo.errors && debugInfo.errors.length === 0 && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-700">모든 테스트가 성공했습니다!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};