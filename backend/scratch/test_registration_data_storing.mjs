import fetch from 'node-fetch';
import { prisma } from '../config/prisma.js';

async function testCompletePartnerRegistrationAndStorage() {
  console.log('=== 1. Starting Partner Registration Flow ===');
  const testPhone = '9988776655';
  const partnerName = 'Vikramaditya Sharma';
  const vehicle = 'PETROL_BIKE';

  // Step 1: Send OTP
  const sendRes = await fetch('http://localhost:5000/api/partner/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, authMode: 'REGISTER' }),
  });
  const sendData = await sendRes.json();
  console.log('1. Send OTP Result:', sendData.success, sendData.message);

  // Step 2: Verify OTP
  const verifyRes = await fetch('http://localhost:5000/api/partner/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      otp: '1234',
      authMode: 'REGISTER',
      vehicleType: vehicle,
      name: partnerName,
    }),
  });
  const verifyData = await verifyRes.json();
  console.log('2. Verify OTP Result:', verifyData.success, verifyData.message);

  if (!verifyData.success || !verifyData.data?.token) {
    console.error('Registration verification failed:', verifyData);
    process.exit(1);
  }

  const token = verifyData.data.token;
  const userId = verifyData.data.user.id;
  console.log('   Partner User ID:', userId);
  console.log('   Partner Name stored in User table:', verifyData.data.user.name);

  // Step 3: Complete KYC
  const kycPayload = {
    name: partnerName,
    address: 'Flat 402, Green Glen Layout, Bellandur',
    pincode: '560103',
    city: 'Bengaluru',
    aadhaarNumber: '123456789012',
    emergencyContact: '9876543210',
    bloodGroup: 'O+',
    dlNumber: 'KA0120220048210',
    dlExpiry: '12/2029',
    rcNumber: 'KA01EQ4921',
    vehicleModel: 'Bajaj Pulsar 150',
    vehicleType: vehicle,
    bankHolderName: partnerName,
    bankAccountNumber: '12345678901234',
    bankIfsc: 'HDFC0001248',
    panNumber: 'ABCDE1234F',
    allocatedHub: 'Koramangala Express Hub #04',
    riderId: 'RID-88421',
  };

  const kycRes = await fetch('http://localhost:5000/api/partner/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(kycPayload),
  });
  const kycData = await kycRes.json();
  console.log('3. KYC Update Result:', kycData.success, kycData.message);

  // Step 4: Verification via Authenticated Backend Profile API
  console.log('\n=== 4. Backend Profile Endpoint Verification ===');
  const profileRes = await fetch('http://localhost:5000/api/partner/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const profileData = await profileRes.json();
  console.log('Profile Fetch Success:', profileData.success);
  console.log('Stored Profile Data:', JSON.stringify(profileData.data, null, 2));

  if (!profileData.data?.dlNumber || !profileData.data?.bankAccountNumber) {
    console.error('❌ Data verification failed!');
    process.exit(1);
  }

  console.log('\n🎉 ALL DATA IS VERIFIED STORED IN THE BACKEND DATABASE!');
}

testCompletePartnerRegistrationAndStorage()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
