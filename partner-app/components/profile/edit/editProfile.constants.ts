export interface VehicleTypeOption {
  key: string;
  label: string;
}

export const BLOOD_GROUPS: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const VEHICLE_TYPES: VehicleTypeOption[] = [
  { key: 'EV_BIKE', label: '⚡ EV Bike' },
  { key: 'PETROL_BIKE', label: '🏍️ Petrol Bike' },
  { key: 'SCOOTER', label: '🛵 Scooter' },
  { key: 'CYCLE', label: '🚲 Cycle' },
];

export interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  bloodGroup: string;
  vehicleType: string;
  vehicleModel: string;
  rcNumber: string;
  dlNumber: string;
  dlExpiry: string;
  aadhaarNumber: string;
  panNumber: string;
  bankHolderName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  address: string;
  city: string;
  pincode: string;
  allocatedHub: string;
}

export const validateEditProfileForm = (form: EditProfileFormData): { isValid: boolean; error?: string } => {
  if (!form.name.trim() || form.name.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid full name (minimum 2 characters)' };
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  if (form.emergencyContact.trim() && !/^[6-9]\d{9}$/.test(form.emergencyContact.trim())) {
    return { isValid: false, error: 'Emergency contact must be a valid 10-digit mobile number' };
  }

  if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
    return { isValid: false, error: 'Pincode must be a 6-digit postal code' };
  }

  if (form.aadhaarNumber.trim() && !/^\d{12}$/.test(form.aadhaarNumber.replace(/\D/g, ''))) {
    return { isValid: false, error: 'Aadhaar number must be exactly 12 numeric digits' };
  }

  if (form.panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.trim().toUpperCase())) {
    return { isValid: false, error: 'PAN number must be 10 alphanumeric characters (e.g. ABCDE1234F)' };
  }

  if (form.bankIfsc.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIfsc.trim().toUpperCase())) {
    return { isValid: false, error: 'Please enter a valid 11-character IFSC code (e.g. HDFC0001248)' };
  }

  return { isValid: true };
};
