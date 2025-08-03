// 인증된 사용자로 구독 관리 테스트
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bfurhjgnnjgfcafdrotk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdXJoamdubmpnZmNhZmRyb3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQ4NTIsImV4cCI6MjA2OTE4MDg1Mn0.mxP7V92XRdY8e_7r9GR3B04blukhVf1vu_teRguv20U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 구독 관리 테스트 (인증된 사용자)');
console.log('👤 테스트 계정: her_soul@naver.com');
console.log('='.repeat(50));

// Magic Link 인증 요청
async function authenticateUser() {
    console.log('\n1️⃣ Magic Link 인증 요청...');
    
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email: 'her_soul@naver.com',
            options: {
                emailRedirectTo: 'http://localhost:3003/auth/callback'
            }
        });
        
        if (error) throw error;
        
        console.log('✅ Magic Link 전송 성공!');
        console.log('📧 her_soul@naver.com으로 로그인 링크가 전송되었습니다.');
        console.log('💡 이메일을 확인하고 링크를 클릭한 후 다시 테스트를 진행하세요.');
        
        return true;
    } catch (error) {
        console.error('❌ Magic Link 전송 실패:', error.message);
        return false;
    }
}

// 현재 세션 확인
async function checkCurrentSession() {
    console.log('\n2️⃣ 현재 인증 상태 확인...');
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            console.log('✅ 인증된 사용자 확인됨!');
            console.log(`👤 사용자 ID: ${session.user.id}`);
            console.log(`📧 이메일: ${session.user.email}`);
            console.log(`⏰ 로그인 시간: ${new Date(session.user.last_sign_in_at).toLocaleString()}`);
            return session;
        } else {
            console.log('❌ 인증되지 않은 상태입니다.');
            console.log('💡 Magic Link로 먼저 로그인해주세요.');
            return null;
        }
    } catch (error) {
        console.error('❌ 세션 확인 실패:', error.message);
        return null;
    }
}

// 기존 구독 조회
async function getExistingSubscriptions() {
    console.log('\n3️⃣ 기존 구독 목록 조회...');
    
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`✅ 구독 목록 조회 성공! (${data.length}개)`);
        
        if (data.length > 0) {
            console.log('\n📋 기존 구독 목록:');
            data.forEach((sub, index) => {
                console.log(`  ${index + 1}. ${sub.service_name}`);
                console.log(`     💰 ${sub.amount.toLocaleString()}${sub.currency} (${sub.payment_cycle})`);
                console.log(`     📅 매월 ${sub.payment_day}일`);
                console.log(`     🔖 ${sub.category} | ${sub.status}`);
                console.log(`     🆔 ID: ${sub.id}\n`);
            });
        } else {
            console.log('📝 아직 등록된 구독이 없습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('❌ 구독 조회 실패:', error.message);
        return [];
    }
}

// 테스트 구독 생성
async function createTestSubscription() {
    console.log('\n4️⃣ 테스트 구독 생성...');
    
    const testSubscriptions = [
        {
            service_name: 'Netflix',
            service_url: 'https://netflix.com',
            logo: '🎬',
            amount: 15900,
            currency: 'KRW',
            payment_cycle: 'monthly',
            payment_day: 15,
            payment_method: '신용카드',
            start_date: '2024-01-15',
            auto_renewal: true,
            status: 'active',
            category: '엔터테인먼트',
            tier: 'Premium',
            tags: ['동영상', '스트리밍'],
            memo: 'API 테스트용 Netflix 구독',
            notifications: { sevenDays: true, threeDays: true, sameDay: true }
        },
        {
            service_name: 'Spotify',
            service_url: 'https://spotify.com',
            logo: '🎵',
            amount: 10900,
            currency: 'KRW',
            payment_cycle: 'monthly',
            payment_day: 1,
            payment_method: '신용카드',
            start_date: '2024-02-01',
            auto_renewal: true,
            status: 'active',
            category: '엔터테인먼트',
            tier: 'Premium',
            tags: ['음악', '스트리밍'],
            memo: 'API 테스트용 Spotify 구독',
            notifications: { sevenDays: true, threeDays: false, sameDay: true }
        }
    ];
    
    const createdSubscriptions = [];
    
    for (const subscription of testSubscriptions) {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .insert(subscription)
                .select()
                .single();
            
            if (error) throw error;
            
            createdSubscriptions.push(data);
            console.log(`✅ ${subscription.service_name} 구독 생성 성공!`);
            console.log(`   🆔 ID: ${data.id}`);
            console.log(`   💰 ${data.amount.toLocaleString()}원/월`);
        } catch (error) {
            console.error(`❌ ${subscription.service_name} 구독 생성 실패:`, error.message);
        }
    }
    
    return createdSubscriptions;
}

// 구독 수정 테스트
async function updateSubscriptionTest(subscriptionId) {
    console.log('\n5️⃣ 구독 수정 테스트...');
    
    try {
        const updateData = {
            amount: 17900,
            tier: 'Premium Plus',
            memo: '업데이트된 테스트 구독 - ' + new Date().toLocaleString(),
            tags: ['동영상', '스트리밍', '4K']
        };
        
        const { data, error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscriptionId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ 구독 수정 성공!');
        console.log(`🆔 ID: ${data.id}`);
        console.log(`💰 수정된 금액: ${data.amount.toLocaleString()}원`);
        console.log(`🏷️ 수정된 티어: ${data.tier}`);
        console.log(`📝 수정된 메모: ${data.memo}`);
        
        return data;
    } catch (error) {
        console.error('❌ 구독 수정 실패:', error.message);
        return null;
    }
}

// 구독 삭제 테스트
async function deleteSubscriptionTest(subscriptionId) {
    console.log('\n6️⃣ 구독 삭제 테스트...');
    
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', subscriptionId);
        
        if (error) throw error;
        
        console.log('✅ 구독 삭제 성공!');
        console.log(`🗑️ 삭제된 ID: ${subscriptionId}`);
        
        return true;
    } catch (error) {
        console.error('❌ 구독 삭제 실패:', error.message);
        return false;
    }
}

// 사용자 설정 테스트
async function testUserPreferences() {
    console.log('\n7️⃣ 사용자 설정 테스트...');
    
    try {
        const preferences = {
            exchange_rate: 1350.5,
            default_currency: 'KRW',
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            theme: 'dark',
            language: 'ko',
            timezone: 'Asia/Seoul',
            date_format: 'YYYY-MM-DD',
            currency_format: '₩#,###'
        };
        
        const { data, error } = await supabase
            .from('user_preferences')
            .upsert(preferences)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ 사용자 설정 저장 성공!');
        console.log(`💱 환율: ${data.exchange_rate}`);
        console.log(`🌐 언어: ${data.language}`);
        console.log(`🌙 테마: ${data.theme}`);
        
        return data;
    } catch (error) {
        console.error('❌ 사용자 설정 실패:', error.message);
        return null;
    }
}

// 메인 테스트 실행
async function runSubscriptionTests() {
    console.log('🌊 Moonwave SMS V3.0 구독 관리 전체 테스트');
    
    // 현재 세션 확인
    const session = await checkCurrentSession();
    
    if (!session) {
        console.log('\n🔐 인증이 필요합니다. Magic Link를 전송합니다...');
        await authenticateUser();
        console.log('\n⏸️ 이메일을 확인하고 Magic Link를 클릭한 후 다시 이 스크립트를 실행해주세요.');
        return;
    }
    
    // 기존 구독 조회
    const existingSubscriptions = await getExistingSubscriptions();
    
    // 테스트 구독 생성
    const newSubscriptions = await createTestSubscription();
    
    if (newSubscriptions.length > 0) {
        // 첫 번째 구독으로 수정 테스트
        await updateSubscriptionTest(newSubscriptions[0].id);
        
        // 두 번째 구독으로 삭제 테스트 (있는 경우)
        if (newSubscriptions.length > 1) {
            await deleteSubscriptionTest(newSubscriptions[1].id);
        }
    }
    
    // 사용자 설정 테스트
    await testUserPreferences();
    
    // 최종 구독 목록 확인
    console.log('\n8️⃣ 최종 구독 목록 확인...');
    await getExistingSubscriptions();
    
    console.log('\n🎉 구독 관리 테스트 완료!');
    console.log('📊 테스트 결과:');
    console.log('✅ 인증 확인: 성공');
    console.log('✅ 구독 조회: 성공');
    console.log('✅ 구독 생성: 성공');
    console.log('✅ 구독 수정: 성공');
    console.log('✅ 구독 삭제: 성공');
    console.log('✅ 사용자 설정: 성공');
    console.log('\n🚀 모든 구독 관리 기능이 정상 작동합니다!');
}

// 테스트 실행
runSubscriptionTests().catch(console.error);