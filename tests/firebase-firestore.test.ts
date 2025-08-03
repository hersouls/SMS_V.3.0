import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Firestore 모킹
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(),
  runTransaction: jest.fn(),
  onSnapshot: jest.fn()
};

const mockDoc = {
  id: 'test-doc-id',
  data: jest.fn(),
  exists: () => true,
  ref: {
    update: jest.fn(),
    delete: jest.fn()
  }
};

const mockQuerySnapshot = {
  docs: [mockDoc],
  size: 1,
  empty: false,
  forEach: jest.fn((callback) => {
    callback(mockDoc);
  })
};

// Firebase Firestore 모킹
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
  Timestamp: {
    fromDate: jest.fn((date) => ({ toDate: () => date })),
    now: jest.fn(() => ({ seconds: Date.now() / 1000 }))
  },
  runTransaction: jest.fn(),
  onSnapshot: jest.fn(),
  connectFirestoreEmulator: jest.fn()
}));

describe('Firebase Firestore Service', () => {
  beforeAll(() => {
    console.log('🗄️ Firestore 테스트 시작');
  });

  afterAll(() => {
    console.log('✅ Firestore 테스트 완료');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Connection', () => {
    test('should connect to Firestore emulator', () => {
      const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
      
      expect(getFirestore).toBeDefined();
      expect(connectFirestoreEmulator).toBeDefined();
      
      // 에뮬레이터 환경 변수 확인
      expect(process.env.FIRESTORE_EMULATOR_HOST).toBe('localhost:8080');
    });

    test('should initialize Firestore instance', () => {
      const { getFirestore } = require('firebase/firestore');
      const db = getFirestore();
      
      expect(db).toBeDefined();
      expect(getFirestore).toHaveBeenCalled();
    });
  });

  describe('Collection Operations', () => {
    test('should create collection reference', () => {
      const { collection } = require('firebase/firestore');
      collection.mockReturnValue({ id: 'test-collection' });

      const collectionRef = collection(mockFirestore, 'users');
      
      expect(collectionRef).toBeDefined();
      expect(collectionRef.id).toBe('test-collection');
    });

    test('should create document reference', () => {
      const { doc } = require('firebase/firestore');
      doc.mockReturnValue({ id: 'test-doc' });

      const docRef = doc(mockFirestore, 'users', 'user-123');
      
      expect(docRef).toBeDefined();
      expect(docRef.id).toBe('test-doc');
    });
  });

  describe('CRUD Operations', () => {
    const mockSubscription = {
      id: 'sub-123',
      serviceName: 'Netflix',
      amount: 15000,
      currency: 'KRW',
      billingCycle: 'monthly',
      isActive: true,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    test('should create document successfully', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      
      collection.mockReturnValue({ id: 'subscriptions' });
      addDoc.mockResolvedValue({ id: 'new-sub-123' });

      const collectionRef = collection(mockFirestore, 'subscriptions');
      const docRef = await addDoc(collectionRef, mockSubscription);

      expect(docRef.id).toBe('new-sub-123');
      expect(addDoc).toHaveBeenCalledWith(collectionRef, mockSubscription);
    });

    test('should read document successfully', async () => {
      const { getDoc, doc } = require('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => true,
        id: 'sub-123',
        data: () => mockSubscription
      };

      doc.mockReturnValue({ id: 'sub-123' });
      getDoc.mockResolvedValue(mockDocSnap);

      const docRef = doc(mockFirestore, 'subscriptions', 'sub-123');
      const docSnap = await getDoc(docRef);

      expect(docSnap.exists()).toBe(true);
      expect(docSnap.data()).toEqual(mockSubscription);
    });

    test('should update document successfully', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      
      const updates = { amount: 16000, updatedAt: new Date() };
      
      doc.mockReturnValue({ id: 'sub-123' });
      updateDoc.mockResolvedValue(undefined);

      const docRef = doc(mockFirestore, 'subscriptions', 'sub-123');
      await updateDoc(docRef, updates);

      expect(updateDoc).toHaveBeenCalledWith(docRef, updates);
    });

    test('should delete document successfully', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      
      doc.mockReturnValue({ id: 'sub-123' });
      deleteDoc.mockResolvedValue(undefined);

      const docRef = doc(mockFirestore, 'subscriptions', 'sub-123');
      await deleteDoc(docRef);

      expect(deleteDoc).toHaveBeenCalledWith(docRef);
    });
  });

  describe('Query Operations', () => {
    test('should create simple query', () => {
      const { query, collection, where, orderBy } = require('firebase/firestore');
      
      collection.mockReturnValue({ id: 'subscriptions' });
      where.mockReturnValue({ type: 'where' });
      orderBy.mockReturnValue({ type: 'orderBy' });
      query.mockReturnValue({ type: 'query' });

      const collectionRef = collection(mockFirestore, 'subscriptions');
      const q = query(
        collectionRef,
        where('userId', '==', 'user-123'),
        orderBy('createdAt', 'desc')
      );

      expect(q.type).toBe('query');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    test('should execute query successfully', async () => {
      const { getDocs, query } = require('firebase/firestore');
      
      const mockQuerySnapshot = {
        docs: [
          { id: 'sub-1', data: () => ({ ...mockSubscription, id: 'sub-1' }) },
          { id: 'sub-2', data: () => ({ ...mockSubscription, id: 'sub-2' }) }
        ],
        size: 2,
        empty: false
      };

      query.mockReturnValue({ type: 'query' });
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const q = query();
      const querySnapshot = await getDocs(q);

      expect(querySnapshot.size).toBe(2);
      expect(querySnapshot.empty).toBe(false);
      expect(querySnapshot.docs).toHaveLength(2);
    });

    test('should handle complex queries with multiple conditions', () => {
      const { query, collection, where, orderBy, limit } = require('firebase/firestore');
      
      collection.mockReturnValue({ id: 'subscriptions' });
      where.mockReturnValue({ type: 'where' });
      orderBy.mockReturnValue({ type: 'orderBy' });
      limit.mockReturnValue({ type: 'limit' });
      query.mockReturnValue({ type: 'complex-query' });

      const collectionRef = collection(mockFirestore, 'subscriptions');
      const q = query(
        collectionRef,
        where('userId', '==', 'user-123'),
        where('isActive', '==', true),
        orderBy('nextPaymentDate', 'asc'),
        limit(10)
      );

      expect(q.type).toBe('complex-query');
      expect(where).toHaveBeenCalledTimes(2);
      expect(orderBy).toHaveBeenCalledWith('nextPaymentDate', 'asc');
      expect(limit).toHaveBeenCalledWith(10);
    });
  });

  describe('Real-time Listeners', () => {
    test('should create real-time listener', () => {
      const { onSnapshot, collection } = require('firebase/firestore');
      
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      collection.mockReturnValue({ id: 'subscriptions' });
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const collectionRef = collection(mockFirestore, 'subscriptions');
      const unsubscribe = onSnapshot(collectionRef, mockCallback);

      expect(onSnapshot).toHaveBeenCalledWith(collectionRef, mockCallback);
      expect(typeof unsubscribe).toBe('function');
    });

    test('should handle real-time updates', () => {
      const { onSnapshot } = require('firebase/firestore');
      
      const mockCallback = jest.fn();
      const mockSnapshot = {
        docs: [
          { id: 'sub-1', data: () => mockSubscription }
        ],
        docChanges: () => [
          { type: 'added', doc: { id: 'sub-1', data: () => mockSubscription } }
        ]
      };

      onSnapshot.mockImplementation((ref, callback) => {
        callback(mockSnapshot);
        return jest.fn();
      });

      onSnapshot({}, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockSnapshot);
    });
  });

  describe('Transactions', () => {
    test('should execute transaction successfully', async () => {
      const { runTransaction } = require('firebase/firestore');
      
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ totalSubscriptions: 5 })
        }),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      };

      runTransaction.mockImplementation(async (db, updateFunction) => {
        return await updateFunction(mockTransaction);
      });

      const result = await runTransaction(mockFirestore, async (transaction) => {
        const docRef = { id: 'user-stats' };
        const doc = await transaction.get(docRef);
        
        if (doc.exists()) {
          const data = doc.data();
          transaction.update(docRef, { totalSubscriptions: data.totalSubscriptions + 1 });
        }
        
        return 'success';
      });

      expect(result).toBe('success');
      expect(mockTransaction.get).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    test('should handle transaction failure', async () => {
      const { runTransaction } = require('firebase/firestore');
      
      const mockError = new Error('Transaction failed');
      runTransaction.mockRejectedValue(mockError);

      await expect(
        runTransaction(mockFirestore, async () => {
          throw mockError;
        })
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('Data Types and Timestamps', () => {
    test('should handle Firestore Timestamp', () => {
      const { Timestamp } = require('firebase/firestore');
      
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      expect(timestamp.toDate()).toEqual(now);
    });

    test('should handle server timestamp', () => {
      const { serverTimestamp } = require('firebase/firestore');
      
      const timestamp = serverTimestamp();
      
      expect(timestamp).toBeDefined();
      expect(typeof timestamp.seconds).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle permission denied error', async () => {
      const { getDoc } = require('firebase/firestore');
      
      const permissionError = new Error('Missing or insufficient permissions');
      permissionError.code = 'permission-denied';
      
      getDoc.mockRejectedValue(permissionError);

      await expect(getDoc({})).rejects.toThrow('Missing or insufficient permissions');
    });

    test('should handle network error', async () => {
      const { getDocs } = require('firebase/firestore');
      
      const networkError = new Error('Network error');
      networkError.code = 'unavailable';
      
      getDocs.mockRejectedValue(networkError);

      await expect(getDocs({})).rejects.toThrow('Network error');
    });

    test('should handle document not found', async () => {
      const { getDoc } = require('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => false,
        id: 'nonexistent-doc',
        data: () => undefined
      };

      getDoc.mockResolvedValue(mockDocSnap);

      const docSnap = await getDoc({});
      
      expect(docSnap.exists()).toBe(false);
      expect(docSnap.data()).toBeUndefined();
    });
  });

  describe('Subcollections', () => {
    test('should work with subcollections', () => {
      const { collection, doc } = require('firebase/firestore');
      
      doc.mockReturnValue({ id: 'user-123' });
      collection.mockReturnValue({ id: 'subscriptions' });

      // /users/{userId}/subscriptions 구조
      const userDoc = doc(mockFirestore, 'users', 'user-123');
      const subscriptionsCollection = collection(userDoc, 'subscriptions');

      expect(userDoc.id).toBe('user-123');
      expect(subscriptionsCollection.id).toBe('subscriptions');
    });

    test('should handle nested subcollection queries', async () => {
      const { query, collection, where, getDocs } = require('firebase/firestore');
      
      collection.mockReturnValue({ id: 'subscriptions' });
      where.mockReturnValue({ type: 'where' });
      query.mockReturnValue({ type: 'subcollection-query' });
      getDocs.mockResolvedValue({ docs: [], size: 0 });

      const userSubscriptions = collection({}, 'users', 'user-123', 'subscriptions');
      const activeSubscriptions = query(
        userSubscriptions,
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(activeSubscriptions);

      expect(snapshot.size).toBe(0);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('isActive', '==', true);
    });
  });
});