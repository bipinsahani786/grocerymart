import { z } from "zod";

const sanitizePhone = (val) => {
  if (typeof val !== "string") return val;
  // Remove country code (+91 or 91) if 12-13 digits, or non-digits
  let clean = val.replace(/\D/g, "");
  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2);
  }
  return clean;
};

const sanitizeAadhaar = (val) => {
  if (typeof val !== "string") return val;
  return val.replace(/\D/g, "");
};

/**
 * Zod validation schema for requesting a Delivery Partner OTP
 */
export const sendPartnerOtpSchema = z.object({
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
    authMode: z.enum(["LOGIN", "REGISTER"], {
      invalid_type_error: "Auth mode must be either LOGIN or REGISTER",
    }).optional().default("LOGIN"),
  }),
});

/**
 * Zod validation schema for verifying partner OTP
 */
export const verifyPartnerOtpSchema = z.object({
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
    authMode: z.enum(["LOGIN", "REGISTER"]).optional().default("LOGIN"),
    vehicleType: z.enum(["EV_BIKE", "PETROL_BIKE", "SCOOTER", "CYCLE"], {
      invalid_type_error: "Vehicle type must be EV_BIKE, PETROL_BIKE, SCOOTER, or CYCLE",
    }).optional().default("EV_BIKE"),
    name: z
      .string()
      .trim()
      .max(60, "Name cannot exceed 60 characters")
      .optional(),
  }),
});

const sanitizeOptionalString = (val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
};

/**
 * Zod validation schema for updating partner profile (Personal, Address, Vehicle, Bank)
 */
export const updatePartnerProfileSchema = z.object({
  body: z.object({
    name: z
      .preprocess(
        sanitizeOptionalString,
        z
          .string()
          .min(2, "Full name must be at least 2 characters")
          .max(60, "Full name cannot exceed 60 characters")
          .optional()
          .nullable()
      ),
    email: z
      .preprocess(
        sanitizeOptionalString,
        z
          .string()
          .email("Please enter a valid email address (e.g. name@example.com)")
          .optional()
          .nullable()
      ),
    avatar: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    profilePhotoUri: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    address: z
      .preprocess(
        sanitizeOptionalString,
        z.string().min(3, "Address must be at least 3 characters").optional().nullable()
      ),
    city: z
      .preprocess(
        sanitizeOptionalString,
        z.string().min(2, "City name must be at least 2 characters").optional().nullable()
      ),
    pincode: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/\D/g, "") : undefined;
      },
      z
        .string()
        .regex(/^\d{6}$/, "Pincode must be a valid 6-digit Indian postal code (e.g. 560103)")
        .optional()
        .nullable()
    ),
    aadhaarNumber: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? sanitizeAadhaar(s) : undefined;
      },
      z
        .string()
        .refine((val) => !val || (val.length === 12 && /^\d{12}$/.test(val)), {
          message: "Aadhaar number must be exactly 12 numeric digits",
        })
        .optional()
        .nullable()
    ),
    emergencyContact: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? sanitizePhone(s) : undefined;
      },
      z
        .string()
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
          message: "Emergency contact must be a valid 10-digit mobile number",
        })
        .optional()
        .nullable()
    ),
    bloodGroup: z.preprocess(
      sanitizeOptionalString,
      z
        .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
          invalid_type_error: "Please select a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)",
        })
        .optional()
        .nullable()
    ),
    dlNumber: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/[\s-]/g, "").toUpperCase() : undefined;
      },
      z
        .string()
        .refine(
          (val) => !val || (val.length >= 8 && val.length <= 20 && /^[A-Z0-9]{8,20}$/.test(val)),
          {
            message: "Driving License number must be between 8 and 20 alphanumeric characters (e.g. KA0120220048210)",
          }
        )
        .optional()
        .nullable()
    ),
    dlExpiry: z.preprocess(
      sanitizeOptionalString,
      z
        .string()
        .refine(
          (val) => !val || /^(0[1-9]|1[0-2])\/\d{4}$/.test(val),
          {
            message: "DL Expiry must be in MM/YYYY format (e.g. 12/2028)",
          }
        )
        .optional()
        .nullable()
    ),
    rcNumber: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/[\s-]/g, "").toUpperCase() : undefined;
      },
      z
        .string()
        .refine(
          (val) => !val || (val.length >= 6 && val.length <= 15 && /^[A-Z0-9]{6,15}$/.test(val)),
          {
            message: "Vehicle RC number must be between 6 and 15 alphanumeric characters (e.g. KA01EQ4921)",
          }
        )
        .optional()
        .nullable()
    ),
    vehicleModel: z.preprocess(
      sanitizeOptionalString,
      z
        .string()
        .min(2, "Vehicle make & model must be at least 2 characters")
        .max(50, "Vehicle make & model cannot exceed 50 characters")
        .optional()
        .nullable()
    ),
    vehicleType: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    vehiclePhotoUri: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    bankHolderName: z.preprocess(
      sanitizeOptionalString,
      z.string().min(2, "Account holder name must be at least 2 characters").optional().nullable()
    ),
    bankAccountNumber: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/\D/g, "") : undefined;
      },
      z
        .string()
        .regex(/^\d{9,18}$/, "Bank account number must be between 9 and 18 digits")
        .optional()
        .nullable()
    ),
    bankIfsc: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/[\s-]/g, "").toUpperCase() : undefined;
      },
      z
        .string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid 11-character IFSC code (e.g. HDFC0001248)")
        .optional()
        .nullable()
    ),
    panNumber: z.preprocess(
      (val) => {
        const s = sanitizeOptionalString(val);
        return s ? s.replace(/[\s-]/g, "").toUpperCase() : undefined;
      },
      z
        .string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid 10-character PAN number (e.g. ABCDE1234F)")
        .optional()
        .nullable()
    ),
    allocatedHub: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    riderId: z.preprocess(sanitizeOptionalString, z.string().optional().nullable()),
    isOnline: z.boolean().optional(),
    currentLat: z.number().optional().nullable(),
    currentLong: z.number().optional().nullable(),
  }),
});
