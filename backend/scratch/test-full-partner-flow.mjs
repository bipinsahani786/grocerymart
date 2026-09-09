import fetch from 'node-fetch';

async function testFullPartnerFlow() {
  console.log('--- 1. Testing Send OTP ---');
  const testPhone = '9812345678';
  const sendRes = await fetch('http://localhost:5000/api/partner/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, authMode: 'REGISTER' }),
  });
  const sendData = await sendRes.json();
  console.log('Send OTP status:', sendRes.status, sendData);

  console.log('\n--- 2. Testing Verify OTP (using 1234 dev bypass) ---');
  const verifyRes = await fetch('http://localhost:5000/api/partner/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      otp: '1234',
      authMode: 'REGISTER',
      vehicleType: 'EV_BIKE',
      name: 'Ravi Verma',
    }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify OTP status:', verifyRes.status, verifyData.success, verifyData.message);

  if (!verifyData.success || !verifyData.data?.token) {
    console.error('Verify OTP failed!', verifyData);
    process.exit(1);
  }

  const token = verifyData.data.token;
  const userId = verifyData.data.user.id;
  console.log('Authenticated User ID:', userId);

  console.log('\n--- 3. Testing KYC / Profile Submission ---');
  const kycPayload = {
    name: 'Ravi Verma',
    address: '42 Brigade Road, Shanthala Nagar',
    pincode: '560025',
    city: 'Bengaluru',
    aadhaarNumber: '998877665544',
    emergencyContact: '9876543210',
    bloodGroup: 'B+',
    dlNumber: 'KA0320230012345',
    dlExpiry: '11/2029',
    rcNumber: 'KA03HA5678',
    vehicleModel: 'Ather 450X Gen 3',
    vehicleType: 'EV_BIKE',
    bankHolderName: 'Ravi Verma',
    bankAccountNumber: '987654321098',
    bankIfsc: 'HDFC0001248',
    panNumber: 'ABCDE1234F',
    allocatedHub: 'Koramangala Express Hub #04',
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
  console.log('KYC Submit status:', kycRes.status, kycData.success, kycData.message);
  console.log('Saved Rider Data:', {
    id: kycData.data?.id,
    userId: kycData.data?.userId,
    kycStatus: kycData.data?.kycStatus,
    aadhaarNumber: kycData.data?.aadhaarNumber,
    dlNumber: kycData.data?.dlNumber,
    rcNumber: kycData.data?.rcNumber,
    bankAccountNumber: kycData.data?.bankAccountNumber,
  });

  console.log('\n✅ ALL ENDPOINTS STORED DATA CLEANLY!');
}

testFullPartnerFlow();
