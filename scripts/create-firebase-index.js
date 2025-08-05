import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔥 Firebase 인덱스 생성 안내');
console.log('================================\n');

console.log('다음 URL을 브라우저에서 열어 인덱스를 생성하세요:\n');

// 에러 메시지에서 제공된 URL
const indexUrl = 'https://console.firebase.google.com/v1/r/project/sms-v3/firestore/indexes?create_composite=Cltwcm9qZWN0cy9zbXMtdjMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1YnNjcmlwdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg';

console.log('📌 주요 인덱스 URL:');
console.log(`1. userId + createdAt (DESC): ${indexUrl}\n`);

console.log('또는 Firebase Console에서 수동으로 생성하세요:');
console.log('1. https://console.firebase.google.com/project/sms-v3/firestore/indexes');
console.log('2. "인덱스 만들기" 클릭');
console.log('3. 다음 설정으로 인덱스 생성:\n');

console.log('📋 subscriptions 컬렉션 인덱스:');
console.log('   - 컬렉션 ID: subscriptions');
console.log('   - 필드 1: userId (오름차순)');
console.log('   - 필드 2: createdAt (내림차순)');
console.log('   - 쿼리 범위: 컬렉션\n');

console.log('📋 notifications 컬렉션 인덱스:');
console.log('   - 컬렉션 ID: notifications');
console.log('   - 필드 1: userId (오름차순)');
console.log('   - 필드 2: createdAt (내림차순)');
console.log('   - 쿼리 범위: 컬렉션\n');

console.log('✅ 인덱스 생성 후 몇 분 정도 기다리면 적용됩니다.');
console.log('✅ firestore.indexes.json 파일은 이미 업데이트되어 있습니다.');