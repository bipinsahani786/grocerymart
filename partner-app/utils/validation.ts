/**
 * Reusable client-side validation utilities for Partner App
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleanValue: string;
}

/**
 * Validate 10-digit Indian mobile number
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const cleanValue = (phone || '').replace(/\D/g, '');

  if (!cleanValue) {
    return { isValid: false, error: 'Mobile number cannot be empty', cleanValue };
  }

  if (cleanValue.length < 10) {
    return {
      isValid: false,
      error: `Please enter all 10 digits (${cleanValue.length}/10 entered)`,
      cleanValue,
    };
  }

  if (cleanValue.length > 10) {
    return {
      isValid: false,
      error: 'Mobile number cannot exceed 10 digits',
      cleanValue: cleanValue.slice(0, 10),
    };
  }

  if (!/^[6-9]/.test(cleanValue)) {
    return {
      isValid: false,
      error: 'Mobile number must start with 6, 7, 8, or 9',
      cleanValue,
    };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate 4-digit OTP code
 */
export function validateOtp(otp: string): ValidationResult {
  const cleanValue = (otp || '').trim();

  if (!cleanValue) {
    return { isValid: false, error: 'Please enter the 4-digit OTP', cleanValue };
  }

  if (cleanValue.length !== 4 || !/^\d{4}$/.test(cleanValue)) {
    return {
      isValid: false,
      error: 'OTP must be exactly 4 numeric digits',
      cleanValue,
    };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate Indian Pincode (6 digits)
 */
export function validatePincode(pincode: string): ValidationResult {
  const cleanValue = (pincode || '').replace(/\D/g, '');

  if (!cleanValue) {
    return { isValid: false, error: 'Pincode is required', cleanValue };
  }

  if (cleanValue.length !== 6 || !/^\d{6}$/.test(cleanValue)) {
    return { isValid: false, error: 'Please enter a valid 6-digit postal pincode', cleanValue };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate 12-digit Aadhaar Number
 */
export function validateAadhaar(aadhaar: string): ValidationResult {
  const cleanValue = (aadhaar || '').replace(/\s/g, '');

  if (!cleanValue) {
    return { isValid: false, error: 'Aadhaar number is required', cleanValue };
  }

  if (!/^\d{12}$/.test(cleanValue)) {
    return { isValid: false, error: 'Aadhaar must be a 12-digit numeric number', cleanValue };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate 10-character PAN card format (e.g. ABCDE1234F)
 */
export function validatePan(pan: string): ValidationResult {
  const cleanValue = (pan || '').trim().toUpperCase();

  if (!cleanValue) {
    return { isValid: false, error: 'PAN number is required', cleanValue };
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanValue)) {
    return { isValid: false, error: 'Invalid PAN format (e.g. ABCPS4821F)', cleanValue };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate Bank IFSC Code (11 characters, 5th char is 0)
 */
export function validateIfsc(ifsc: string): ValidationResult {
  const cleanValue = (ifsc || '').trim().toUpperCase();

  if (!cleanValue) {
    return { isValid: false, error: 'IFSC code is required', cleanValue };
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanValue)) {
    return { isValid: false, error: 'Invalid IFSC code (e.g. HDFC0001248)', cleanValue };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate Bank Account Number (9 to 18 digits)
 */
export function validateBankAccount(account: string): ValidationResult {
  const cleanValue = (account || '').replace(/\D/g, '');

  if (!cleanValue) {
    return { isValid: false, error: 'Account number is required', cleanValue };
  }

  if (cleanValue.length < 9 || cleanValue.length > 18) {
    return { isValid: false, error: 'Account number must be between 9 and 18 digits', cleanValue };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate Driving License number (8 to 20 alphanumeric characters)
 */
export function validateDlNumber(dl: string): ValidationResult {
  const raw = (dl || '').trim().toUpperCase();
  const cleanValue = raw.replace(/[\s-]/g, '');

  if (!raw) {
    return { isValid: false, error: 'Driving License (DL) number is required', cleanValue: raw };
  }

  if (cleanValue.length < 8 || cleanValue.length > 20) {
    return {
      isValid: false,
      error: `DL number must be between 8 and 20 alphanumeric characters (${cleanValue.length} entered)`,
      cleanValue: raw,
    };
  }

  if (!/^[A-Z0-9]{8,20}$/.test(cleanValue)) {
    return {
      isValid: false,
      error: 'DL number can only contain letters and numbers (e.g. KA0120220048210)',
      cleanValue: raw,
    };
  }

  return { isValid: true, cleanValue: raw };
}

/**
 * Format Indian DL Number: uppercase, strips special characters except alphanumeric, max 20 chars
 */
export function formatDlNumber(text: string): string {
  return (text || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
}

/**
 * Format Indian RC Plate Number: uppercase, strips special characters except alphanumeric, max 15 chars
 */
export function formatRcNumber(text: string): string {
  return (text || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
}

/**
 * Format raw digits into MM/YYYY string
 */
export function formatExpiryDate(text: string): string {
  const digits = (text || '').replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
}

/**
 * Validate DL Expiry Date (MM/YYYY format, valid month 01-12, not in the past)
 */
export function validateDlExpiry(expiry: string): ValidationResult {
  const cleanValue = (expiry || '').trim();

  if (!cleanValue) {
    return { isValid: false, error: 'DL Expiry date is required (MM/YYYY)', cleanValue };
  }

  const match = cleanValue.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
  if (!match) {
    return {
      isValid: false,
      error: 'Expiry date must be in MM/YYYY format (e.g. 12/2028)',
      cleanValue,
    };
  }

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return {
      isValid: false,
      error: 'Driving License has expired. Please provide a valid active DL.',
      cleanValue,
    };
  }

  if (year > currentYear + 30) {
    return {
      isValid: false,
      error: `Expiry year cannot be more than 30 years in future (${year})`,
      cleanValue,
    };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate Vehicle Registration (RC) number (6 to 15 alphanumeric characters)
 */
export function validateRcNumber(rc: string): ValidationResult {
  const raw = (rc || '').trim().toUpperCase();
  const cleanValue = raw.replace(/[\s-]/g, '');

  if (!raw) {
    return { isValid: false, error: 'Vehicle RC number is required', cleanValue: raw };
  }

  if (cleanValue.length < 6 || cleanValue.length > 15) {
    return {
      isValid: false,
      error: `RC number must be between 6 and 15 alphanumeric characters (${cleanValue.length} entered)`,
      cleanValue: raw,
    };
  }

  if (!/^[A-Z0-9]{6,15}$/.test(cleanValue)) {
    return {
      isValid: false,
      error: 'RC number can only contain letters and numbers (e.g. KA01EQ4921)',
      cleanValue: raw,
    };
  }

  return { isValid: true, cleanValue: raw };
}

/**
 * Validate Vehicle Make & Model
 */
export function validateVehicleModel(model: string): ValidationResult {
  const cleanValue = (model || '').trim();

  if (!cleanValue) {
    return { isValid: false, error: 'Vehicle make & model is required', cleanValue };
  }

  if (cleanValue.length < 2) {
    return {
      isValid: false,
      error: 'Vehicle make & model must be at least 2 characters (e.g. Hero Splendor, Honda Activa, Ather 450X)',
      cleanValue,
    };
  }

  if (cleanValue.length > 50) {
    return {
      isValid: false,
      error: 'Vehicle make & model cannot exceed 50 characters',
      cleanValue: cleanValue.slice(0, 50),
    };
  }

  return { isValid: true, cleanValue };
}

/**
 * Validate 12-digit Indian Aadhaar number (cannot exceed or be less than 12 digits)
 */
export function validateAadhaarNumber(aadhaar: string): ValidationResult {
  const cleanValue = (aadhaar || '').replace(/\D/g, '');

  if (!cleanValue) {
    return { isValid: false, error: 'Aadhaar number is required', cleanValue };
  }

  if (cleanValue.length < 12) {
    return {
      isValid: false,
      error: `Please enter all 12 digits of Aadhaar card (${cleanValue.length}/12 entered)`,
      cleanValue,
    };
  }

  if (cleanValue.length > 12) {
    return {
      isValid: false,
      error: 'Aadhaar number cannot exceed 12 digits',
      cleanValue: cleanValue.slice(0, 12),
    };
  }

  if (!/^\d{12}$/.test(cleanValue)) {
    return { isValid: false, error: 'Aadhaar number must contain only numeric digits', cleanValue };
  }

  return { isValid: true, cleanValue };
}

