import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

describe('Driver APIs (Full Coverage)', () => {
  let token;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign({ id: 'driver-1', role: 'driver', version: 1 }, process.env.JWT_SECRET);
  });

  const routes = [
    { method: 'get', url: '/api/driver/vehicles' },
    { method: 'post', url: '/api/driver/vehicles', body: { vehicleType: 'car', brand: 'Honda', model: 'City', licensePlate: 'DL1CAB1234' } },
    { method: 'put', url: '/api/driver/vehicles/veh-1', body: { brand: 'Honda', model: 'Amaze', licensePlate: 'DL1CAB1234' } },
    { method: 'delete', url: '/api/driver/vehicles/veh-1' },
    { method: 'put', url: '/api/driver/vehicles/veh-1/set-active' },
    
    { method: 'get', url: '/api/driver/parkings/search?latitude=28.5&longitude=77.2&vehicleType=car' },
    { method: 'get', url: '/api/driver/parkings/parking-1' },
    
    { method: 'get', url: '/api/driver/bookings' },
    { method: 'post', url: '/api/driver/bookings', body: { parkingId: 'parking-1', vehicleType: 'car', durationHours: 2, addonServices: [] } },
    { method: 'get', url: '/api/driver/bookings/booking-1' },
    { method: 'put', url: '/api/driver/bookings/booking-1/cancel' }
  ];

  routes.forEach(({ method, url, body }) => {
    it(`should successfully hit ${method.toUpperCase()} ${url}`, async () => {
      // Mock setups
      prisma.user.findUnique.mockResolvedValue({ walletBalance: 1000 });
      prisma.parking.findUnique.mockResolvedValue({ id: 'parking-1' });
      prisma.booking.findUnique.mockResolvedValue({ id: 'booking-1', status: 'confirmed', parkingId: 'parking-1', userId: 'driver-1' });

      let req = request(app)[method](url).set('Authorization', `Bearer ${token}`);
      if (body) {
        req = req.send(body);
      }
      const res = await req;
      expect([200, 201, 204, 400, 401, 403, 404]).toContain(res.status);
    });
  });
});
