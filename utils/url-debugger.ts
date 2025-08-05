// URL 파라미터 디버깅 유틸리티
export const debugCurrentUrl = () => {
  const url = window.location.href;
  const search = window.location.search;
  const hash = window.location.hash;
  const pathname = window.location.pathname;
  
  console.log('🔍 현재 URL 정보:', {
    fullUrl: url,
    pathname,
    search,
    hash,
    hasFirebaseParams: url.includes('__firebase'),
    hasOAuthParams: search.includes('code=') || search.includes('access_token'),
    hasErrorParams: search.includes('error=')
  });
  
  // URL 파라미터 파싱
  const params = new URLSearchParams(search);
  const paramObj: Record<string, string> = {};
  
  params.forEach((value, key) => {
    paramObj[key] = value;
  });
  
  console.log('🔍 URL 파라미터:', paramObj);
  
  // Hash 파라미터 파싱 (Firebase Magic Link용)
  if (hash) {
    console.log('🔍 Hash 파라미터:', hash);
    const hashParams = new URLSearchParams(hash.substring(1));
    const hashObj: Record<string, string> = {};
    
    hashParams.forEach((value, key) => {
      hashObj[key] = value;
    });
    
    console.log('🔍 Hash 파라미터 객체:', hashObj);
  }
  
  return {
    url,
    pathname,
    search,
    hash,
    params: paramObj
  };
};

// 매직 링크 감지
export const detectMagicLink = () => {
  const url = window.location.href;
  
  const isFirebaseMagicLink = url.includes('__firebase') || 
                             url.includes('continueUrl') ||
                             url.includes('mode=signIn');
                             
  const isOAuthCallback = url.includes('code=') || 
                         url.includes('access_token') ||
                         url.includes('state=');
  
  console.log('🔍 링크 타입 감지:', {
    isFirebaseMagicLink,
    isOAuthCallback,
    url
  });
  
  return {
    isFirebaseMagicLink,
    isOAuthCallback
  };
};

// 로컬 스토리지 디버깅
export const debugLocalStorage = () => {
  console.log('🔍 로컬 스토리지 확인:', {
    emailForSignIn: localStorage.getItem('emailForSignIn'),
    firebaseKeys: Object.keys(localStorage).filter(key => key.includes('firebase')),
    allKeys: Object.keys(localStorage)
  });
};