import "dotenv/config";
import { partnerService } from "../src/partner/partner.service.js";
import { otpStore } from "../src/utils/otp/otp.store.js";
import { prisma } from "../config/prisma.js";

async function testPartnerAuth() {
  console.log("=== Testing Delivery Partner Auth Backend ===");
  const testPhone = "9876543210";

  // 1. Send OTP
  console.log("1. Sending OTP to", testPhone);
  const sendRes = await partnerService.sendOtp({ phone: testPhone, authMode: "REGISTER" });
  console.log("Send OTP Response:", sendRes);

  // 2. Fetch OTP from memory store
  const stored = otpStore.get(testPhone);
  console.log("Generated OTP in store:", stored?.otp);

  // 3. Verify OTP
  console.log("3. Verifying OTP...");
  const verifyRes = await partnerService.verifyOtp({
    phone: testPhone,
    otp: stored.otp,
    authMode: "REGISTER",
    vehicleType: "EV_BIKE",
    name: "Sahil Test Captain",
  });
  console.log("Verify OTP Response:", JSON.stringify(verifyRes, null, 2));

  // 4. Verify DeliveryPartner row exists in database
  const partnerInDb = await prisma.deliveryPartner.findUnique({
    where: { userId: verifyRes.data.user.id },
    include: { user: true },
  });
  console.log("Found in delivery_partners table:", partnerInDb ? "YES (id: " + partnerInDb.id + ")" : "NO");

  // 5. Fetch Profile
  const profileRes = await partnerService.getProfile(verifyRes.data.user.id);
  console.log("Partner Profile:", profileRes.user.name, "| Status:", profileRes.kycStatus, "| Table ID:", profileRes.id);
}

testPartnerAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test Error:", err);
    process.exit(1);
  });
