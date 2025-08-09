import { useState } from 'react';
// Supabase 클라이언트는 현재 번들에 포함되지 않음. 스텁 처리합니다.
const supabase = { auth: { getSession: async () => ({ data: { session: null }, error: null }) }, from: () => ({ select: () => ({ data: [], error: { message: 'disabled' } }), eq: () => ({ data: [], error: { message: 'disabled' } }) }) } as any;

export const QuickDataTest = () => {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testDirectQuery = async () => {
    setIsLoading(true);
    setResult('Testing...');

    try {
      // Test 1: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setResult(`❌ Session error: ${sessionError.message}`);
        return;
      }

      if (!session) {
        setResult('❌ No session found - user not authenticated');
        return;
      }

      const userId = session.user.id;
      setResult(prev => prev + `\n✅ Auth session OK, User ID: ${userId}`);

      // Test 2: Simple subscription count query
      const { data: countData, error: countError } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        setResult(prev => prev + `\n❌ Count query error: ${countError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ Total subscriptions accessible: ${countData?.length || 0}`);

      // Test 3: Fetch actual data
      const { data: subscriptions, error: dataError } = await supabase
        .from('subscriptions')
        .select('id, service_name, amount, user_id')
        .limit(3);

      if (dataError) {
        setResult(prev => prev + `\n❌ Data query error: ${dataError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ Sample data (${subscriptions?.length || 0} items):`);
      
      if (subscriptions && subscriptions.length > 0) {
        subscriptions.forEach((sub, index) => {
          setResult(prev => prev + `\n  ${index + 1}. ${sub.service_name} - ${sub.amount} (User: ${sub.user_id === userId ? 'MINE' : 'OTHER'})`);
        });
      } else {
        setResult(prev => prev + '\n  No subscription data found');
      }

      // Test 4: Check user-specific data
      const { data: userSubs, error: userError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (userError) {
        setResult(prev => prev + `\n❌ User-specific query error: ${userError.message}`);
      } else {
        setResult(prev => prev + `\n✅ User-specific subscriptions: ${userSubs?.length || 0}`);
      }

    } catch (error: any) {
      setResult(prev => prev + `\n❌ General error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg max-w-2xl">
      <h3 className="text-lg font-bold mb-4">빠른 데이터 테스트</h3>
      
      <button
        onClick={testDirectQuery}
        disabled={isLoading}
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? '테스트 중...' : '데이터 접근 테스트'}
      </button>

      {result && (
        <div className="bg-gray-900 p-3 rounded font-mono text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
};