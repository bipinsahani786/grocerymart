import axios from "axios";

/**
 * 2Factor.in SMS Gateway Implementation
 */
class TwoFactorGateway {
  constructor() {
    this.apiKey = process.env.TWO_FACTOR_API_KEY;
    this.template = process.env.TWO_FACTOR_TEMPLATE || "OTPSMS";
  }

  async sendSms(phone, otp) {
    if (process.env.BYPASS_REAL_SMS === "true" || !this.apiKey || this.apiKey.includes("your-api-key")) {
      console.log(`[SMS SIMULATION] Bypassing real SMS to prevent calls/charges. OTP for ${phone} is: ${otp}`);
      return { success: true, simulated: true };
    }

    try {
      // 2Factor API: https://2factor.in/API/V1/{api_key}/SMS/{phone}/{otp}/{template_name}
      const url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${phone}/${otp}/${this.template}`;
      await axios.get(url);
      console.log(`[SMS SUCCESS] OTP ${otp} sent to ${phone} via 2Factor`);
      return { success: true };
    } catch (error) {
      console.error(`[SMS GATEWAY ERROR] 2Factor failed for ${phone}:`, error.message);
      console.log(`[SMS FALLBACK SIMULATION] OTP for ${phone} is: ${otp}`);
      return { success: true, simulated: true };
    }
  }
}

// Future implementations like TwilioGateway, Msg91Gateway can be added here
// export const smsGateway = new TwilioGateway(); 

export const smsGateway = new TwoFactorGateway();
