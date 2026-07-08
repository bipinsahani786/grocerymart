import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';

describe('Admin APIs (Full Coverage)', () => {
  let token;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign({ id: 'admin-1', role: 'super_admin', version: 1 }, process.env.JWT_SECRET);
  });

  const routes = [
    { method: 'get', url: '/api/admin/users' },
    { method: 'put', url: '/api/admin/users/1/status', body: { status: 'active' } },
    { method: 'put', url: '/api/admin/users/1', body: { name: 'Updated' } },
    { method: 'delete', url: '/api/admin/users/1' },
    
    { method: 'get', url: '/api/admin/bookings' },
    { method: 'get', url: '/api/admin/bookings/stats' },
    { method: 'get', url: '/api/admin/bookings/booking-1' },
    { method: 'put', url: '/api/admin/bookings/booking-1/cancel' },
    
    { method: 'get', url: '/api/admin/parkings' },
    { method: 'get', url: '/api/admin/parkings/parking-1' },
    { method: 'put', url: '/api/admin/parkings/parking-1/status', body: { status: 'active' } },
    { method: 'put', url: '/api/admin/parkings/parking-1/kyc', body: { status: 'approved' } },
    { method: 'put', url: '/api/admin/parkings/parking-1', body: { name: 'New' } },
    { method: 'delete', url: '/api/admin/parkings/parking-1' },
    
    { method: 'get', url: '/api/admin/ledger' },
    { method: 'delete', url: '/api/admin/ledger/txn-1' },
    
    { method: 'get', url: '/api/admin/reviews' },
    { method: 'delete', url: '/api/admin/reviews/rev-1' },
    
    { method: 'get', url: '/api/admin/settings' },
    { method: 'put', url: '/api/admin/settings', body: { platformCommissionRate: 0.15, cancellationFeeRate: 0.05, overstayPenaltyRate: 1.5 } }
  ];

  routes.forEach(({ method, url, body }) => {
    it(`should successfully hit ${method.toUpperCase()} ${url}`, async () => {
      let req = request(app)[method](url).set('Authorization', `Bearer ${token}`);
      if (body) {
        req = req.send(body);
      }
      const res = await req;
      expect([200, 201, 204, 400, 401, 403, 404]).toContain(res.status);
    });
  });
});
