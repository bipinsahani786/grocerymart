import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
    userType: z.enum(["driver", "owner", "admin"], {
      required_error: "User type is required",
    }),
    adminRole: z.enum(["super_admin", "ops_staff"]).optional(),
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email is required for registration",
  }),
});

export const verifyRegisterOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    otp: z.string().length(4, "OTP must be 4 digits"),
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email is required to verify registration OTP",
  }),
});

export const loginOtpSendSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required").optional(),
    email: z.string().email("Invalid email format").optional(),
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email is required to send login OTP",
  }),
});

export const loginOtpVerifySchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    otp: z.string().length(4, "OTP must be 4 digits"),
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email is required to verify login OTP",
  }),
});

export const loginPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});
