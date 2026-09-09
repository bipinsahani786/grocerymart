import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { id: 'f21929df-aa56-4006-b502-973572b7dd9a', role: 'delivery_partner' },
  'supersecretjwtaccesskey12345_abc_xyz'
);

async function test() {
  const payload = {
    name: 'Sahil Kumar',
    address: '123 Main Street',
    pincode: '560103',
    city: 'Bangalore',
    aadhaarNumber: '123456789012',
    emergencyContact: '9876543210',
    bloodGroup: '', // Empty string!
    dlNumber: 'KA0120220048210',
    dlExpiry: '', // Empty string!
    rcNumber: 'KA01EQ4921',
    vehicleModel: 'Hero Splendor',
    vehicleType: 'EV_BIKE',
    bankHolderName: 'Sahil Kumar',
    bankAccountNumber: '', // Empty string!
    bankIfsc: '', // Empty string!
    panNumber: '', // Empty string!
    allocatedHub: 'Koramangala Express Hub #04',
  };

  const res = await fetch('http://localhost:5000/api/partner/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', JSON.stringify(json, null, 2));
}

test();
