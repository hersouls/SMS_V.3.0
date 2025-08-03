import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { SupabaseTestSuite, TestResult, quickConnectTest, quickSignupTest } from '../utils/supabase-test';

export const SupabaseTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const [testName, setTestName] = useState('Test User');

  const runQuickTest = async () => {
    setIsRunning(true);
    try {
      const isConnected = await quickConnectTest();
      setResults([{
        test: '빠른 연결 테스트',
        success: isConnected,
        error: isConnected ? undefined : '연결 실패',
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      setResults([{
        test: '빠른 연결 테스트',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    setIsRunning(false);
  };

  const runSignupTest = async () => {
    if (!testEmail || !testPassword) {
      alert('테스트 이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsRunning(true);
    try {
      const result = await quickSignupTest(testEmail, testPassword, testName);
      setResults([result]);
    } catch (error: any) {
      setResults([{
        test: '회원가입 테스트',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    setIsRunning(false);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    try {
      const tester = new SupabaseTestSuite();
      const allResults = await tester.runAllTests(testEmail, testPassword, testName);
      setResults(allResults);
    } catch (error: any) {
      console.error('전체 테스트 실행 중 오류:', error);
    }
    setIsRunning(false);
  };

  const getResultBadge = (success: boolean) => (
    <Badge variant={success ? "default" : "destructive"}>
      {success ? "통과" : "실패"}
    </Badge>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Supabase 테스트 패널</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">테스트 이메일</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">테스트 비밀번호</Label>
              <Input
                id="test-password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="6자 이상"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-name">테스트 이름</Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runQuickTest} 
              disabled={isRunning}
              variant="outline"
            >
              빠른 연결 테스트
            </Button>
            <Button 
              onClick={runSignupTest} 
              disabled={isRunning}
              variant="outline"
            >
              회원가입 테스트
            </Button>
            <Button 
              onClick={runFullTest} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              전체 테스트 실행
            </Button>
          </div>

          {isRunning && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">테스트 실행 중...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 테스트 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    {getResultBadge(result.success)}
                  </div>
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mb-2">
                      ❌ {result.error}
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="text-sm text-gray-600">
                      <details>
                        <summary className="cursor-pointer">데이터 보기</summary>
                        <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(result.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">📈 요약 통계</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">전체:</span>
                  <span className="ml-2 font-medium">{results.length}</span>
                </div>
                <div>
                  <span className="text-green-600">통과:</span>
                  <span className="ml-2 font-medium">{results.filter(r => r.success).length}</span>
                </div>
                <div>
                  <span className="text-red-600">실패:</span>
                  <span className="ml-2 font-medium">{results.filter(r => !r.success).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 테스트 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>빠른 연결 테스트:</strong> Supabase 기본 연결 상태만 확인
          </div>
          <div>
            <strong>회원가입 테스트:</strong> 실제 계정을 생성하여 회원가입 플로우 테스트
          </div>
          <div>
            <strong>전체 테스트:</strong> 연결, 테이블, 트리거, RLS 정책, 데이터 삽입 등 모든 기능 테스트
          </div>
          <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <strong>⚠️ 주의:</strong> 회원가입 테스트는 실제 계정을 생성합니다. 
            테스트용 이메일을 사용하세요.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};