import "dotenv/config";
import { sendPartnerOtpSchema, verifyPartnerOtpSchema, updatePartnerProfileSchema } from "../src/partner/partner.schema.js";

function testValidation() {
  console.log("=== Testing Delivery Partner Server-Side Validation ===");

  // Test 1: Invalid Phone (< 10 digits)
  try {
    sendPartnerOtpSchema.parse({ body: { phone: "98765" } });
    console.error("❌ Test 1 Failed: Should have rejected short phone");
  } catch (err) {
    console.log("✅ Test 1 Passed (Short phone error):", err.issues[0]?.message);
  }

  // Test 2: Invalid Phone (starts with 5)
  try {
    sendPartnerOtpSchema.parse({ body: { phone: "5123456789" } });
    console.error("❌ Test 2 Failed: Should have rejected non 6-9 phone");
  } catch (err) {
    console.log("✅ Test 2 Passed (Prefix error):", err.issues[0]?.message);
  }

  // Test 3: Invalid OTP (letters / short)
  try {
    verifyPartnerOtpSchema.parse({ body: { phone: "9876543210", otp: "12A" } });
    console.error("❌ Test 3 Failed: Should have rejected invalid OTP");
  } catch (err) {
    console.log("✅ Test 3 Passed (Invalid OTP error):", err.issues[0]?.message);
  }

  // Test 4: Valid Phone and OTP
  const validOtp = verifyPartnerOtpSchema.parse({
    body: {
      phone: "+91 98765-43210",
      otp: "1234",
      authMode: "LOGIN",
      vehicleType: "EV_BIKE",
    },
  });
  console.log("✅ Test 4 Passed (Valid payload parsed & sanitized phone):", validOtp.body.phone, "OTP:", validOtp.body.otp);

  // Test 5: Profile Validation with bad PAN and Pincode
  try {
    updatePartnerProfileSchema.parse({
      body: {
        panNumber: "INVALIDPAN",
        pincode: "5601",
      },
    });
    console.error("❌ Test 5 Failed: Should have rejected bad PAN/Pincode");
  } catch (err) {
    console.log("✅ Test 5 Passed (Bad PAN/Pincode errors):", err.issues.map(i => i.message));
  }
}

testValidation();
