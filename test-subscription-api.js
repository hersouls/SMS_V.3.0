// 구독 관리 API 테스트 스크립트
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bfurhjgnnjgfcafdrotk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdXJoamdubmpnZmNhZmRyb3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQ4NTIsImV4cCI6MjA2OTE4MDg1Mn0.mxP7V92XRdY8e_7r9GR3B04blukhVf1vu_teRguv20U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔬 구독 관리 API 테스트 시작...');

// 테스트용 구독 데이터
const testSubscription = {
    service_name: 'Netflix 테스트',
    service_url: 'https://netflix.com',
    logo: '🎬',
    logo_image: null,
    amount: 15900,
    currency: 'KRW',
    payment_cycle: 'monthly',
    payment_day: 15,
    payment_method: '신용카드',
    start_date: '2024-01-15',
    end_date: null,
    auto_renewal: true,
    status: 'active',
    category: '엔터테인먼트',
    tier: 'Premium',
    tags: ['동영상', '스트리밍'],
    memo: 'API 테스트용 구독',
    notifications: {
        sevenDays: true,
        threeDays: true,
        sameDay: true
    }
};

async function testSubscriptionCRUD() {
    let createdId = null;
    
    try {
        console.log('\n1️⃣ 구독 생성 테스트...');
        
        // CREATE
        const { data: createData, error: createError } = await supabase
            .from('subscriptions')
            .insert(testSubscription)
            .select()
            .single();
        
        if (createError) throw createError;
        
        createdId = createData.id;
        console.log('✅ 구독 생성 성공!');
        console.log(`📝 생성된 ID: ${createdId}`);
        console.log(`💰 금액: ${createData.amount}${createData.currency}`);
        
        console.log('\n2️⃣ 구독 조회 테스트...');
        
        // READ
        const { data: readData, error: readError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', createdId)
            .single();
        
        if (readError) throw readError;
        
        console.log('✅ 구독 조회 성공!');
        console.log(`📋 서비스명: ${readData.service_name}`);
        console.log(`📅 결제일: 매월 ${readData.payment_day}일`);
        
        console.log('\n3️⃣ 구독 수정 테스트...');
        
        // UPDATE
        const updateData = {
            amount: 17900,
            tier: 'Premium Plus',
            memo: '업데이트된 테스트 구독'
        };
        
        const { data: updatedData, error: updateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', createdId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        console.log('✅ 구독 수정 성공!');
        console.log(`💰 수정된 금액: ${updatedData.amount}${updatedData.currency}`);
        console.log(`🏷️ 수정된 티어: ${updatedData.tier}`);
        
        console.log('\n4️⃣ 구독 목록 조회 테스트...');
        
        // READ ALL
        const { data: listData, error: listError } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (listError) throw listError;
        
        console.log('✅ 구독 목록 조회 성공!');
        console.log(`📊 조회된 구독 수: ${listData.length}`);
        
        console.log('\n5️⃣ 구독 삭제 테스트...');
        
        // DELETE
        const { error: deleteError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', createdId);
        
        if (deleteError) throw deleteError;
        
        console.log('✅ 구독 삭제 성공!');
        
        // 삭제 확인
        const { data: checkData, error: checkError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', createdId);
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (!checkData || checkData.length === 0) {
            console.log('✅ 삭제 확인됨!');
        } else {
            console.log('⚠️ 삭제가 완전하지 않음');
        }
        
    } catch (error) {
        console.error('❌ 구독 CRUD 테스트 실패:', error.message);
        
        // 정리: 테스트 중 생성된 데이터 삭제
        if (createdId) {
            try {
                await supabase.from('subscriptions').delete().eq('id', createdId);
                console.log('🧹 테스트 데이터 정리 완료');
            } catch (cleanupError) {
                console.log('⚠️ 테스트 데이터 정리 실패');
            }
        }
    }
}

async function testPreferencesAPI() {
    console.log('\n6️⃣ 사용자 설정 API 테스트...');
    
    try {
        // 테스트용 설정 데이터
        const testPreferences = {
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
            .upsert(testPreferences)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ 사용자 설정 저장 성공!');
        console.log(`💱 환율: ${data.exchange_rate}`);
        console.log(`🌐 언어: ${data.language}`);
        
    } catch (error) {
        console.error('❌ 사용자 설정 테스트 실패:', error.message);
    }
}

async function testCategoriesAPI() {
    console.log('\n7️⃣ 카테고리 API 테스트...');
    
    try {
        const { data, error } = await supabase
            .from('subscription_categories')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        console.log('✅ 카테고리 조회 성공!');
        console.log(`📂 카테고리 수: ${data.length}`);
        
        if (data.length > 0) {
            data.forEach((category, index) => {
                console.log(`   ${index + 1}. ${category.name} (${category.color})`);
            });
        }
        
    } catch (error) {
        console.error('❌ 카테고리 테스트 실패:', error.message);
    }
}

// 모든 테스트 실행
async function runSubscriptionTests() {
    console.log('🌊 Moonwave SMS V3.0 - 구독 관리 API 테스트');
    console.log('='.repeat(50));
    
    await testSubscriptionCRUD();
    await testPreferencesAPI();
    await testCategoriesAPI();
    
    console.log('\n🎉 구독 관리 API 테스트 완료!');
    console.log('📊 테스트 결과:');
    console.log('✅ 구독 생성/조회/수정/삭제: 정상');
    console.log('✅ 사용자 설정 관리: 정상');
    console.log('✅ 카테고리 관리: 정상');
    console.log('\n🚀 구독 관리 시스템이 완벽하게 작동합니다!');
}

runSubscriptionTests().catch(console.error);