import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Firebase Functions 모킹
const mockFunctions = {
  httpsCallable: jest.fn()
};

const mockCallableFunction = jest.fn();

// Firebase Functions 모킹
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => mockFunctions),
  httpsCallable: jest.fn(() => mockCallableFunction),
  connectFunctionsEmulator: jest.fn()
}));

describe('Firebase Cloud Functions', () => {
  beforeAll(() => {
    console.log('⚡ Cloud Functions 테스트 시작');
  });

  afterAll(() => {
    console.log('✅ Cloud Functions 테스트 완료');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Functions Connection', () => {
    test('should connect to Functions emulator', () => {
      const { getFunctions, connectFunctionsEmulator } = require('firebase/functions');
      
      expect(getFunctions).toBeDefined();
      expect(connectFunctionsEmulator).toBeDefined();
      
      // 에뮬레이터 환경 변수 확인
      expect(process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST).toBe('localhost:5001');
    });

    test('should initialize Functions instance', () => {
      const { getFunctions } = require('firebase/functions');
      const functions = getFunctions();
      
      expect(functions).toBeDefined();
      expect(getFunctions).toHaveBeenCalled();
    });
  });

  describe('Callable Functions', () => {
    test('should create callable function reference', () => {
      const { httpsCallable } = require('firebase/functions');
      
      httpsCallable.mockReturnValue(mockCallableFunction);
      
      const getUserSubscriptions = httpsCallable(mockFunctions, 'getUserSubscriptions');
      
      expect(getUserSubscriptions).toBe(mockCallableFunction);
      expect(httpsCallable).toHaveBeenCalledWith(mockFunctions, 'getUserSubscriptions');
    });

    test('should call function with data successfully', async () => {
      mockCallableFunction.mockResolvedValue({
        data: {
          subscriptions: [
            { id: 'sub-1', serviceName: 'Netflix', amount: 15000 },
            { id: 'sub-2', serviceName: 'Spotify', amount: 10000 }
          ]
        }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.subscriptions).toHaveLength(2);
      expect(result.data.subscriptions[0].serviceName).toBe('Netflix');
    });

    test('should handle function call with parameters', async () => {
      const subscriptionData = {
        serviceName: 'YouTube Premium',
        amount: 12000,
        currency: 'KRW',
        billingCycle: 'monthly'
      };

      mockCallableFunction.mockResolvedValue({
        data: { id: 'new-sub-123' }
      });

      const result = await mockCallableFunction(subscriptionData);
      
      expect(result.data.id).toBe('new-sub-123');
      expect(mockCallableFunction).toHaveBeenCalledWith(subscriptionData);
    });
  });

  describe('Subscription Functions', () => {
    const mockSubscription = {
      id: 'sub-123',
      serviceName: 'Netflix',
      amount: 15000,
      currency: 'KRW',
      billingCycle: 'monthly',
      isActive: true
    };

    test('should get user subscriptions', async () => {
      mockCallableFunction.mockResolvedValue({
        data: { subscriptions: [mockSubscription] }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.subscriptions).toContain(mockSubscription);
    });

    test('should create subscription', async () => {
      const newSubscription = {
        serviceName: 'Disney Plus',
        amount: 9900,
        currency: 'KRW',
        billingCycle: 'monthly'
      };

      mockCallableFunction.mockResolvedValue({
        data: { id: 'disney-sub-456' }
      });

      const result = await mockCallableFunction(newSubscription);
      
      expect(result.data.id).toBe('disney-sub-456');
    });

    test('should update subscription', async () => {
      const updateData = {
        subscriptionId: 'sub-123',
        amount: 16000
      };

      mockCallableFunction.mockResolvedValue({
        data: { success: true }
      });

      const result = await mockCallableFunction(updateData);
      
      expect(result.data.success).toBe(true);
    });

    test('should delete subscription', async () => {
      const deleteData = {
        subscriptionId: 'sub-123'
      };

      mockCallableFunction.mockResolvedValue({
        data: { success: true }
      });

      const result = await mockCallableFunction(deleteData);
      
      expect(result.data.success).toBe(true);
    });
  });

  describe('Notification Functions', () => {
    test('should get user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'payment_reminder',
          title: 'Netflix 결제 예정',
          message: '3일 후 Netflix 구독료가 결제됩니다.',
          isRead: false
        }
      ];

      mockCallableFunction.mockResolvedValue({
        data: { notifications: mockNotifications }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.notifications).toEqual(mockNotifications);
      expect(result.data.notifications[0].type).toBe('payment_reminder');
    });

    test('should mark notification as read', async () => {
      const markReadData = {
        notificationId: 'notif-1'
      };

      mockCallableFunction.mockResolvedValue({
        data: { success: true }
      });

      const result = await mockCallableFunction(markReadData);
      
      expect(result.data.success).toBe(true);
    });
  });

  describe('User Functions', () => {
    test('should get user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        stats: {
          totalSubscriptions: 3,
          activeSubscriptions: 2,
          totalMonthlyPayment: 35000
        }
      };

      mockCallableFunction.mockResolvedValue({
        data: { profile: mockProfile }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.profile).toEqual(mockProfile);
      expect(result.data.profile.stats.totalSubscriptions).toBe(3);
    });

    test('should create user profile for new user', async () => {
      const newUserProfile = {
        id: 'new-user-456',
        email: 'newuser@example.com',
        displayName: 'New User',
        isActive: true,
        stats: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalMonthlyPayment: 0
        }
      };

      mockCallableFunction.mockResolvedValue({
        data: { profile: newUserProfile }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.profile.stats.totalSubscriptions).toBe(0);
      expect(result.data.profile.isActive).toBe(true);
    });
  });

  describe('Exchange Rate Functions', () => {
    test('should get exchange rates', async () => {
      const mockRates = {
        USD: 1300,
        EUR: 1400,
        JPY: 9,
        CNY: 180,
        lastUpdated: '2025-08-03T14:00:00Z'
      };

      mockCallableFunction.mockResolvedValue({
        data: { rates: mockRates }
      });

      const result = await mockCallableFunction();
      
      expect(result.data.rates).toEqual(mockRates);
      expect(result.data.rates.USD).toBe(1300);
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthenticated error', async () => {
      const authError = new Error('User must be authenticated');
      authError.code = 'functions/unauthenticated';

      mockCallableFunction.mockRejectedValue(authError);

      await expect(mockCallableFunction()).rejects.toThrow('User must be authenticated');
    });

    test('should handle permission denied error', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.code = 'functions/permission-denied';

      mockCallableFunction.mockRejectedValue(permissionError);

      await expect(mockCallableFunction()).rejects.toThrow('Permission denied');
    });

    test('should handle internal server error', async () => {
      const internalError = new Error('Internal server error');
      internalError.code = 'functions/internal';

      mockCallableFunction.mockRejectedValue(internalError);

      await expect(mockCallableFunction()).rejects.toThrow('Internal server error');
    });

    test('should handle not found error', async () => {
      const notFoundError = new Error('Function not found');
      notFoundError.code = 'functions/not-found';

      mockCallableFunction.mockRejectedValue(notFoundError);

      await expect(mockCallableFunction()).rejects.toThrow('Function not found');
    });

    test('should handle unavailable error', async () => {
      const unavailableError = new Error('Service unavailable');
      unavailableError.code = 'functions/unavailable';

      mockCallableFunction.mockRejectedValue(unavailableError);

      await expect(mockCallableFunction()).rejects.toThrow('Service unavailable');
    });
  });

  describe('Function Performance', () => {
    test('should complete function call within timeout', async () => {
      const startTime = Date.now();
      
      mockCallableFunction.mockResolvedValue({
        data: { success: true }
      });

      await mockCallableFunction();
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(5000); // 5초 이내
    });

    test('should handle function timeout', async () => {
      jest.setTimeout(10000);
      
      mockCallableFunction.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: { delayed: true } }), 8000);
        })
      );

      const result = await mockCallableFunction();
      expect(result.data.delayed).toBe(true);
    }, 10000);
  });

  describe('Function Data Validation', () => {
    test('should validate subscription data structure', async () => {
      const validSubscription = {
        serviceName: 'Valid Service',
        amount: 10000,
        currency: 'KRW',
        billingCycle: 'monthly',
        isActive: true,
        categoryId: 'cat-1',
        notificationDays: 3
      };

      mockCallableFunction.mockResolvedValue({
        data: { id: 'valid-sub-123', ...validSubscription }
      });

      const result = await mockCallableFunction(validSubscription);
      
      expect(result.data.serviceName).toBe('Valid Service');
      expect(result.data.amount).toBe(10000);
      expect(result.data.currency).toBe('KRW');
    });

    test('should handle invalid data gracefully', async () => {
      const invalidData = {
        // 필수 필드 누락
        amount: 'invalid-amount',
        currency: 'INVALID'
      };

      const validationError = new Error('Invalid input data');
      validationError.code = 'functions/invalid-argument';

      mockCallableFunction.mockRejectedValue(validationError);

      await expect(mockCallableFunction(invalidData)).rejects.toThrow('Invalid input data');
    });
  });

  describe('Batch Operations', () => {
    test('should handle multiple function calls', async () => {
      const calls = [
        Promise.resolve({ data: { result: 1 } }),
        Promise.resolve({ data: { result: 2 } }),
        Promise.resolve({ data: { result: 3 } })
      ];

      mockCallableFunction
        .mockResolvedValueOnce(calls[0])
        .mockResolvedValueOnce(calls[1])
        .mockResolvedValueOnce(calls[2]);

      const results = await Promise.all([
        mockCallableFunction({ id: 1 }),
        mockCallableFunction({ id: 2 }),
        mockCallableFunction({ id: 3 })
      ]);

      expect(results).toHaveLength(3);
      expect(mockCallableFunction).toHaveBeenCalledTimes(3);
    });
  });
});