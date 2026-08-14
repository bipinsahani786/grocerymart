import nodemailer from "nodemailer";
import { smsGateway } from "../gateways/sms.gateway.js";
import { AppError } from "../AppError.js";

/**
 * Single Responsibility: Delivery of OTP messages across Email and SMS channels.
 */
export class OtpNotifier {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(email, otp, purpose = "Verification") {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Grocery Mart" <noreply@grocerymart.com>`,
      to: email,
      subject: `${purpose} OTP - Grocery Mart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1a1a2e; text-align: center;">Grocery Mart ${purpose}</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for ${purpose.toLowerCase()} is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e94560;">
            ${otp}
          </div>
          <p>This OTP is valid for 15 minutes. Please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Grocery Mart Inc.</p>
        </div>
      `,
    };

    if (process.env.SMTP_USER && !process.env.SMTP_USER.includes("your-email")) {
      await this.transporter.sendMail(mailOptions);
      console.log(`[OTP EMAIL] ✅ Sent to ${email} for ${purpose}`);
    } else {
      console.log(`[OTP DEV] 📧 SMTP not configured. OTP for ${email}: ${otp}`);
    }

    return { success: true, message: "OTP sent successfully via Email" };
  }

  async sendSms(phone, otp, purpose = "Verification") {
    await smsGateway.sendSms(phone, otp);
    console.log(`[OTP SMS] ✅ Sent to ${phone} for ${purpose}`);
    return { success: true, message: "OTP sent successfully via SMS" };
  }
}

export const otpNotifier = new OtpNotifier();
