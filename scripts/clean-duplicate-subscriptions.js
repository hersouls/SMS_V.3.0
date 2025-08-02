import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicateSubscriptions() {
  try {
    console.log('중복 구독 데이터 정리 시작...');

    // 모든 구독 데이터 가져오기
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('구독 데이터 조회 오류:', error);
      return;
    }

    console.log(`총 ${subscriptions.length}개의 구독 데이터 발견`);

    // 사용자별로 그룹화
    const userGroups = {};
    subscriptions.forEach(sub => {
      if (!userGroups[sub.user_id]) {
        userGroups[sub.user_id] = [];
      }
      userGroups[sub.user_id].push(sub);
    });

    let totalDuplicates = 0;
    let totalDeleted = 0;

    // 각 사용자별로 중복 제거
    for (const [userId, userSubs] of Object.entries(userGroups)) {
      console.log(`\n사용자 ${userId}의 구독 처리 중...`);
      console.log(`원본 구독 수: ${userSubs.length}`);

      // 같은 서비스명을 가진 구독들을 그룹화
      const serviceGroups = {};
      userSubs.forEach(sub => {
        const key = `${sub.service_name}_${sub.amount}_${sub.currency}_${sub.payment_cycle}`;
        if (!serviceGroups[key]) {
          serviceGroups[key] = [];
        }
        serviceGroups[key].push(sub);
      });

      // 중복된 구독들 처리
      for (const [key, duplicates] of Object.entries(serviceGroups)) {
        if (duplicates.length > 1) {
          console.log(`\n중복 발견: ${key}`);
          console.log(`중복 수: ${duplicates.length}`);

          // 가장 최근 것을 제외하고 나머지 삭제
          const toDelete = duplicates.slice(1);
          
          for (const duplicate of toDelete) {
            const { error: deleteError } = await supabase
              .from('subscriptions')
              .delete()
              .eq('id', duplicate.id);

            if (deleteError) {
              console.error(`구독 삭제 오류 (ID: ${duplicate.id}):`, deleteError);
            } else {
              console.log(`삭제됨: ${duplicate.service_name} (ID: ${duplicate.id})`);
              totalDeleted++;
            }
          }

          totalDuplicates += duplicates.length - 1;
        }
      }
    }

    console.log(`\n정리 완료!`);
    console.log(`총 중복 구독 수: ${totalDuplicates}`);
    console.log(`삭제된 구독 수: ${totalDeleted}`);

  } catch (error) {
    console.error('스크립트 실행 오류:', error);
  }
}

// 스크립트 실행
cleanDuplicateSubscriptions(); 