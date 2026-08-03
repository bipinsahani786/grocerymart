import { jest } from '@jest/globals';
import { prisma } from '../config/prisma.js';

beforeEach(() => {
  const models = ['user', 'store', 'product', 'order', 'category', 'bill', 'inventory', 'shift', 'settings', 'systemSetting'];
  
  const genericMock = {
    id: 'generic-id', phone: '9876543210', email: 'test@example.com', passwordHash: 'hash',
    status: 'active', walletBalance: 1000, userType: 'customer', adminRole: 'super_admin',
    grossAmount: 100, commission: 10, totalCharged: 100, amount: 100,
    balanceAfter: 900, description: 'test', netAmount: 100, finalPayout: 100, reason: 'test', key: 'test', value: {},
    name: 'test', rating: 5, plan: 'basic', startDate: new Date(), endDate: new Date(),
    price: 100, isActive: true, 
    location: {}, latitude: 28, longitude: 77, address: 'Address'
  };

  models.forEach((key) => {
    if (prisma[key]) {
      prisma[key] = {
        findUnique: jest.fn().mockResolvedValue(genericMock),
        findMany: jest.fn().mockResolvedValue([genericMock]),
        findFirst: jest.fn().mockResolvedValue(genericMock),
        create: jest.fn().mockResolvedValue(genericMock),
        update: jest.fn().mockResolvedValue(genericMock),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        delete: jest.fn().mockResolvedValue(genericMock),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(1),
        upsert: jest.fn().mockResolvedValue(genericMock),
        aggregate: jest.fn().mockResolvedValue(genericMock),
        groupBy: jest.fn().mockResolvedValue([genericMock]),
      };
    }
  });

  // Mock Transactions
  prisma.$transaction = jest.fn(async (callback) => {
    if (Array.isArray(callback)) {
      return Promise.all(callback);
    }
    return await callback(prisma);
  });

  // Mock Raw Queries (PostGIS)
  prisma.$executeRawUnsafe = jest.fn().mockResolvedValue(1);
  prisma.$queryRawUnsafe = jest.fn().mockResolvedValue([]);
});

jest.mock('../src/utils/otp.service.js', () => ({
  otpService: {
    sendOtp: jest.fn().mockResolvedValue(true),
    verifyOtp: jest.fn().mockReturnValue(true)
  }
}));
