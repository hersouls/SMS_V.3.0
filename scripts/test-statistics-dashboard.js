// StatisticsDashboard 컴포넌트 에러 테스트 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 StatisticsDashboard 컴포넌트 에러 분석 중...');

const filePath = path.join(__dirname, '..', 'components', 'StatisticsDashboard.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 잠재적 문제점 체크
  const issues = [];
  
  // 1. generateStatisticsReport 함수 사용 확인
  if (content.includes('const statisticsReport = generateStatisticsReport();')) {
    console.log('✅ generateStatisticsReport 함수 정의됨');
  } else {
    issues.push('❌ generateStatisticsReport 함수가 정의되지 않음');
  }
  
  // 2. useRealData 상태 확인
  if (content.includes('const [useRealData, setUseRealData] = useState(true);')) {
    console.log('✅ useRealData 상태 정의됨');
  } else {
    issues.push('❌ useRealData 상태가 정의되지 않음');
  }
  
  // 3. 필수 import 확인
  const imports = [
    'useAuth',
    'useData', 
    'useImprovedRealtimeStats',
    'StatisticsErrorFallback',
    'useErrorHandler',
    'useLoadingState'
  ];
  
  for (const imp of imports) {
    if (content.includes(imp)) {
      console.log(`✅ ${imp} import됨`);
    } else {
      issues.push(`❌ ${imp}가 import되지 않음`);
    }
  }
  
  // 4. 에러 발생 가능한 변수 사용 확인
  const patterns = [
    /statisticsReport\.summary/g,
    /statisticsReport\.trends/g,
    /statisticsReport\.insights/g,
    /useRealData/g,
    /statsError/g,
    /dataLoading/g,
    /statsLoading/g
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`✅ ${pattern.source} 사용됨 (${matches.length}회)`);
    }
  }
  
  // 5. 에러가 발생할 수 있는 패턴 확인
  if (content.includes('statisticsReport') && !content.includes('generateStatisticsReport')) {
    issues.push('❌ statisticsReport 변수를 사용하지만 generateStatisticsReport 함수가 없음');
  }
  
  if (issues.length > 0) {
    console.log('\n🚨 발견된 문제점들:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n✅ 기본적인 구조는 정상입니다.');
  }
  
  // 6. Firebase 관련 함수 사용 확인
  const firebaseFunctions = ['addDoc', 'collection', 'updateDoc', 'deleteDoc'];
  const usedFirebaseFunctions = firebaseFunctions.filter(func => content.includes(func));
  
  if (usedFirebaseFunctions.length > 0) {
    console.log('\n📦 사용된 Firebase 함수들:', usedFirebaseFunctions.join(', '));
  }
  
  console.log('\n🎯 StatisticsDashboard 분석 완료');
  
} catch (error) {
  console.error('❌ 파일 읽기 실패:', error.message);
}