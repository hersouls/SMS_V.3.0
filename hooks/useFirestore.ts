import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  DocumentData,
  QueryConstraint,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../utils/firebase/config';

interface FirestoreState<T = DocumentData> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

interface DocumentState<T = DocumentData> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Firebase 연결 상태 확인
const isFirebaseAvailable = () => {
  return db !== null && db !== undefined;
};

export const useCollection = <T = DocumentData>(
  collectionName: string, 
  constraints?: QueryConstraint[]
): FirestoreState<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    // Firebase가 사용 불가능한 경우
    if (!isFirebaseAvailable()) {
      console.log('ℹ️ Firebase가 설정되지 않았습니다. Supabase를 사용합니다.');
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    console.log('🔍 Firestore 컬렉션 구독 시작:', collectionName);

    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints ? query(collectionRef, ...constraints) : collectionRef;

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          
          console.log('✅ Firestore 데이터 업데이트:', {
            collection: collectionName,
            count: docs.length,
            docs: docs.map(doc => ({ id: doc.id, serviceName: (doc as any).serviceName }))
          });
          
          setData(docs);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('❌ Firestore 구독 오류:', error);
          
          // 연결 오류인 경우 재시도 로직
          if (error.code === 'unavailable' || error.code === 'permission-denied') {
            console.log('🔄 Firestore 연결 재시도 중...');
            setTimeout(() => {
              setError(null);
              setLoading(true);
            }, 5000); // 5초 후 재시도
          } else {
            setError(error);
            setLoading(false);
          }
        }
      );

      return () => {
        console.log('🔍 Firestore 컬렉션 구독 종료:', collectionName);
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Firestore 컬렉션 구독 실패:', error);
      setError(error as Error);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

export const useDocument = <T = DocumentData>(
  collectionName: string,
  docId: string
): DocumentState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setLoading(false);
      return;
    }

    // Firebase가 사용 불가능한 경우
    if (!isFirebaseAvailable()) {
      console.log('ℹ️ Firebase가 설정되지 않았습니다. Supabase를 사용합니다.');
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    console.log('🔍 Firestore 문서 구독 시작:', `${collectionName}/${docId}`);

    try {
      const docRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(docRef,
        (doc) => {
          if (doc.exists()) {
            const docData = {
              id: doc.id,
              ...doc.data()
            } as T;
            
            console.log('✅ Firestore 문서 업데이트:', `${collectionName}/${docId}`);
            setData(docData);
          } else {
            console.log('ℹ️ Firestore 문서 없음:', `${collectionName}/${docId}`);
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('❌ Firestore 문서 구독 오류:', error);
          
          // 연결 오류인 경우 재시도 로직
          if (error.code === 'unavailable' || error.code === 'permission-denied') {
            console.log('🔄 Firestore 연결 재시도 중...');
            setTimeout(() => {
              setError(null);
              setLoading(true);
            }, 5000); // 5초 후 재시도
          } else {
            setError(error);
            setLoading(false);
          }
        }
      );

      return () => {
        console.log('🔍 Firestore 문서 구독 종료:', `${collectionName}/${docId}`);
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Firestore 문서 구독 실패:', error);
      setError(error as Error);
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { data, loading, error };
};

export const useCollectionOnce = <T = DocumentData>(
  collectionName: string,
  constraints?: QueryConstraint[]
): FirestoreState<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    // Firebase가 사용 불가능한 경우
    if (!isFirebaseAvailable()) {
      console.log('ℹ️ Firebase가 설정되지 않았습니다. Supabase를 사용합니다.');
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    console.log('🔍 Firestore 컬렉션 일회성 조회:', collectionName);

    const fetchData = async () => {
      try {
        const collectionRef = collection(db, collectionName);
        const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
        
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        console.log('✅ Firestore 일회성 조회 성공:', {
          collection: collectionName,
          count: docs.length
        });
        
        setData(docs);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('❌ Firestore 일회성 조회 실패:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

export const useDocumentOnce = <T = DocumentData>(
  collectionName: string,
  docId: string
): DocumentState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setLoading(false);
      return;
    }

    // Firebase가 사용 불가능한 경우
    if (!isFirebaseAvailable()) {
      console.log('ℹ️ Firebase가 설정되지 않았습니다. Supabase를 사용합니다.');
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    console.log('🔍 Firestore 문서 일회성 조회:', `${collectionName}/${docId}`);

    const fetchData = async () => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const docData = {
            id: docSnap.id,
            ...docSnap.data()
          } as T;
          
          console.log('✅ Firestore 문서 일회성 조회 성공:', `${collectionName}/${docId}`);
          setData(docData);
        } else {
          console.log('ℹ️ Firestore 문서 없음:', `${collectionName}/${docId}`);
          setData(null);
        }
        
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('❌ Firestore 문서 일회성 조회 실패:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, docId]);

  return { data, loading, error };
};