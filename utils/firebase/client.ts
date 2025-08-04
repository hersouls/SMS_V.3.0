import { auth, db, storage } from './config';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  isSignInWithEmailLink
} from 'firebase/auth';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';

export { auth, db, storage };

export const firebase = { auth, db, storage };

console.log('🔍 Firebase 클라이언트 초기화 완료');

export const checkFirebaseConnection = async () => {
  try {
    console.log('🔍 Firebase 연결 확인 중...');
    
    const user = auth.currentUser;
    console.log('🔑 인증 상태:', {
      hasUser: !!user,
      userId: user?.uid,
      email: user?.email
    });

    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 확인 실패:', error);
    return false;
  }
};

export const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || 'https://sub.moonwave.kr';
};

export const getAllowedOrigins = () => {
  const origins = import.meta.env.VITE_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://sub.moonwave.kr,https://www.sub.moonwave.kr';
  return origins.split(',').map(origin => origin.trim());
};

export const checkAuthStatus = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      console.log('ℹ️ 인증되지 않은 사용자');
      return { isAuthenticated: false, user: null, error: null };
    }
    
    console.log('✅ 인증된 사용자:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    return { 
      isAuthenticated: true, 
      user: user, 
      error: null 
    };
  } catch (error) {
    console.error('❌ 인증 상태 확인 실패:', error);
    return { isAuthenticated: false, user: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ 이메일 로그인 성공:', result.user.uid);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ 이메일 로그인 실패:', error);
    return { user: null, error };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ 이메일 회원가입 성공:', result.user.uid);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ 이메일 회원가입 실패:', error);
    return { user: null, error };
  }
};



export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Google 로그인 성공:', result.user.uid);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Google 로그인 실패:', error);
    return { user: null, error };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ 로그아웃 성공');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ 로그아웃 실패:', error);
    return { success: false, error };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ 문서 생성 성공:', docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error('❌ 문서 생성 실패:', error);
    return { id: null, error };
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: new Error('문서를 찾을 수 없습니다.') };
    }
  } catch (error: any) {
    console.error('❌ 문서 조회 실패:', error);
    return { data: null, error };
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    console.log('✅ 문서 업데이트 성공:', docId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ 문서 업데이트 실패:', error);
    return { success: false, error };
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log('✅ 문서 삭제 성공:', docId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ 문서 삭제 실패:', error);
    return { success: false, error };
  }
};

export const getDocuments = async (collectionName: string, constraints?: QueryConstraint[]) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { data: documents, error: null };
  } catch (error: any) {
    console.error('❌ 문서 목록 조회 실패:', error);
    return { data: [], error };
  }
};

export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: DocumentData[]) => void,
  constraints?: QueryConstraint[]
) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
    
    return onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    });
  } catch (error: any) {
    console.error('❌ 실시간 구독 실패:', error);
    return () => {};
  }
};

export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  } catch (error: any) {
    console.error('❌ 문서 실시간 구독 실패:', error);
    return () => {};
  }
};

export { where, orderBy, limit, Timestamp } from 'firebase/firestore';