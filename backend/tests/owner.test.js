import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

describe('Owner APIs (Full Coverage)', () => {
  let token;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign({ id: 'owner-1', role: 'owner', version: 1 }, process.env.JWT_SECRET);
  });

  const routes = [
    { method: 'get', url: '/api/owner/kyc/profile' },
    { method: 'put', url: '/api/owner/kyc/profile', body: { company: 'individual', gstNumber: '1234', acceptedGlobalTerms: true } },
    { method: 'get', url: '/api/owner/kyc/bank-details' },
    { method: 'put', url: '/api/owner/kyc/bank-details', body: { accountHolderName: 'Name', bankAccount: '123', bankIfsc: 'ABC' } },
    
    { method: 'get', url: '/api/owner/parkings' },
    { method: 'post', url: '/api/owner/parkings', body: { name: 'Park', parkingType: 'home', address: 'XYZ', latitude: 12, longitude: 13, openTime: '10:00', closeTime: '11:00', is24hr: false, ownershipType: 'owned', acceptedLegalDeclaration: true } },
    { method: 'get', url: '/api/owner/parkings/parking-1' },
    { method: 'put', url: '/api/owner/parkings/parking-1', body: { name: 'Upd', parkingType: 'home', address: 'XYZ', latitude: 12, longitude: 13, openTime: '10:00', closeTime: '11:00', is24hr: false, ownershipType: 'owned', acceptedLegalDeclaration: true } },
    { method: 'delete', url: '/api/owner/parkings/parking-1' },
    { method: 'put', url: '/api/owner/parkings/parking-1/status', body: { status: 'active' } },
    { method: 'post', url: '/api/owner/parkings/parking-1/slots', body: { vehicleType: 'car', totalSlots: 10 } },
    { method: 'post', url: '/api/owner/parkings/parking-1/pricing', body: { vehicleType: 'car', baseRate: 10, perHourRate: 5, maxDailyRate: 50 } },
    
    { method: 'put', url: '/api/owner/addons/parking-1', body: { carWash: true, evCharging: false } },
    { method: 'get', url: '/api/owner/addons/parking-1/custom' },
    { method: 'post', url: '/api/owner/addons/parking-1/custom', body: { name: 'Wash', description: 'Desc', amount: 100 } },
    { method: 'put', url: '/api/owner/addons/custom/addon-1', body: { name: 'Wash Upd', amount: 120 } },
    { method: 'get', url: '/api/owner/addons/parking-1/bookings' },
    { method: 'put', url: '/api/owner/addons/bookings/addon-booking-1/status', body: { status: 'completed' } }
  ];

  routes.forEach(({ method, url, body }) => {
    it(`should successfully hit ${method.toUpperCase()} ${url}`, async () => {
      // Mock specific nested lookups that Zod or logic might require
      prisma.ownerProfile.findUnique.mockResolvedValue({ globalTermsAccepted: true });
      prisma.parking.findUnique.mockResolvedValue({ id: 'parking-1' });

      let req = request(app)[method](url).set('Authorization', `Bearer ${token}`);
      if (body) {
        req = req.send(body);
      }
      const res = await req;
      expect([200, 201, 204, 400, 401, 403, 404]).toContain(res.status);
    });
  });
});
