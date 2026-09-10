import { z } from "zod";

const sanitizePhone = (val) => {
  if (typeof val !== "string") return val;
  let clean = val.replace(/\D/g, "");
  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2);
  }
  return clean;
};

/**
 * Validate phone number for existence check
 */
export const loginCheckSchema = z.object({
  body: z.object({
    phone: z.preprocess(
      sanitizePhone,
      z
        .string({ required_error: "Mobile number is required" })
        .min(1, "Mobile number cannot be empty")
        .refine((val) => val.length === 10, {
          message: "Mobile number must be exactly 10 digits",
        })
        .refine((val) => /^[6-9]\d{9}$/.test(val), {
          message: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
        })
    ),
  }),
});

/**
 * Validate phone number for Login OTP request
 */
export const loginSendOtpSchema = z.object({
  body: z.object({
    phone: z.preprocess(
      sanitizePhone,
      z
        .string({ required_error: "Mobile number is required" })
        .min(1, "Mobile number cannot be empty")
        .refine((val) => val.length === 10, {
          message: "Mobile number must be exactly 10 digits",
        })
        .refine((val) => /^[6-9]\d{9}$/.test(val), {
          message: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
        })
    ),
  }),
});

/**
 * Validate phone and 4-digit OTP for Login verification
 */
export const loginVerifyOtpSchema = z.object({
  body: z.object({
    phone: z.preprocess(
      sanitizePhone,
      z
        .string({ required_error: "Mobile number is required" })
        .min(1, "Mobile number cannot be empty")
        .refine((val) => val.length === 10, {
          message: "Mobile number must be exactly 10 digits",
        })
        .refine((val) => /^[6-9]\d{9}$/.test(val), {
          message: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
        })
    ),
    otp: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .string({ required_error: "4-digit OTP is required" })
        .min(1, "OTP cannot be empty")
        .refine((val) => /^\d{4}$/.test(val), {
          message: "OTP must be exactly 4 numeric digits (e.g. 1234)",
        })
    ),
  }),
});
