import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { partnerAuthService } from '../../services/partnerAuth.service';
import {
  EditProfileHeader,
  EditProfileBottomBar,
  PersonalInfoSection,
  VehicleInfoSection,
  KycDocsSection,
  BankDetailsSection,
  ResidenceHubSection,
  validateEditProfileForm,
} from './edit';
import tw from 'twrnc';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { user, deliveryPartner, token, refreshProfile } = useAuthContext();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [vehicleType, setVehicleType] = useState('EV_BIKE');
  const [vehicleModel, setVehicleModel] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [allocatedHub, setAllocatedHub] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Populate state whenever modal opens or deliveryPartner changes
  useEffect(() => {
    if (visible) {
      setName(deliveryPartner?.user?.name || user?.name || '');
      setEmail(deliveryPartner?.user?.email || user?.email || '');
      setPhone(deliveryPartner?.user?.phone || user?.phone || '');
      setEmergencyContact(deliveryPartner?.emergencyContact || '');
      setBloodGroup(deliveryPartner?.bloodGroup || '');
      setVehicleType(deliveryPartner?.vehicleType || user?.vehicleType || 'EV_BIKE');
      setVehicleModel(deliveryPartner?.vehicleModel || '');
      setRcNumber(deliveryPartner?.rcNumber || user?.vehicleNumber || '');
      setDlNumber(deliveryPartner?.dlNumber || '');
      setDlExpiry(deliveryPartner?.dlExpiry || '');
      setAadhaarNumber(deliveryPartner?.aadhaarNumber || '');
      setPanNumber(deliveryPartner?.panNumber || '');
      setBankHolderName(deliveryPartner?.bankHolderName || deliveryPartner?.user?.name || user?.name || '');
      setBankAccountNumber(deliveryPartner?.bankAccountNumber || '');
      setBankIfsc(deliveryPartner?.bankIfsc || '');
      setAddress(deliveryPartner?.address || '');
      setCity(deliveryPartner?.city || '');
      setPincode(deliveryPartner?.pincode || '');
      setAllocatedHub(deliveryPartner?.allocatedHub || user?.currentHub || '');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [visible, deliveryPartner, user]);

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const validation = validateEditProfileForm({
      name,
      email,
      phone,
      emergencyContact,
      bloodGroup,
      vehicleType,
      vehicleModel,
      rcNumber,
      dlNumber,
      dlExpiry,
      aadhaarNumber,
      panNumber,
      bankHolderName,
      bankAccountNumber,
      bankIfsc,
      address,
      city,
      pincode,
      allocatedHub,
    });

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please check your inputs.');
      return;
    }

    if (!token) {
      setErrorMessage('Authentication session expired. Please sign in again.');
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        bloodGroup: bloodGroup || null,
        vehicleType,
        vehicleModel: vehicleModel.trim() || null,
        rcNumber: rcNumber.trim() ? rcNumber.trim().toUpperCase() : null,
        dlNumber: dlNumber.trim() ? dlNumber.trim().toUpperCase() : null,
        dlExpiry: dlExpiry.trim() || null,
        aadhaarNumber: aadhaarNumber.trim() ? aadhaarNumber.replace(/\D/g, '') : null,
        panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : null,
        bankHolderName: bankHolderName.trim() || null,
        bankAccountNumber: bankAccountNumber.trim() ? bankAccountNumber.replace(/\D/g, '') : null,
        bankIfsc: bankIfsc.trim() ? bankIfsc.trim().toUpperCase() : null,
        address: address.trim() || null,
        city: city.trim() || null,
        pincode: pincode.trim() ? pincode.trim() : null,
        allocatedHub: allocatedHub.trim() || null,
      };

      const res = await partnerAuthService.updateProfile(payload, token);

      if (res.success) {
        setSuccessMessage('Profile details updated successfully in database!');
        await refreshProfile();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || res.message || 'Failed to update profile. Please check your inputs.');
      }
    } catch {
      setErrorMessage('Network error while saving profile. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1 bg-white`}
      >
        {/* Sticky Top Header */}
        <EditProfileHeader
          safeTop={safeTop}
          saving={saving}
          onClose={onClose}
          onSave={handleSave}
        />

        {/* Form Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw`px-5 pt-4`, { paddingBottom: insets.bottom + 90 }]}
        >
          {/* Notification Messages */}
          {errorMessage ? (
            <View style={tw`p-3 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center mb-4`}>
              <Ionicons name="alert-circle" size={17} color="#DC2626" style={tw`mr-2`} />
              <Text style={tw`text-xs font-bold text-rose-700 flex-1`}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={tw`p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center mb-4`}>
              <Ionicons name="checkmark-circle" size={17} color="#047857" style={tw`mr-2`} />
              <Text style={tw`text-xs font-bold text-emerald-800 flex-1`}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Section 1: Personal & Contact */}
          <PersonalInfoSection
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            emergencyContact={emergencyContact}
            setEmergencyContact={setEmergencyContact}
            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}
          />

          {/* Section 2: Vehicle Information */}
          <VehicleInfoSection
            vehicleType={vehicleType}
            setVehicleType={setVehicleType}
            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}
            rcNumber={rcNumber}
            setRcNumber={setRcNumber}
          />

          {/* Section 3: KYC & Government Documents */}
          <KycDocsSection
            kycStatus={deliveryPartner?.kycStatus}
            dlNumber={dlNumber}
            setDlNumber={setDlNumber}
            dlExpiry={dlExpiry}
            setDlExpiry={setDlExpiry}
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            panNumber={panNumber}
            setPanNumber={setPanNumber}
          />

          {/* Section 4: Bank Account & Payouts */}
          <BankDetailsSection
            bankHolderName={bankHolderName}
            setBankHolderName={setBankHolderName}
            bankAccountNumber={bankAccountNumber}
            setBankAccountNumber={setBankAccountNumber}
            bankIfsc={bankIfsc}
            setBankIfsc={setBankIfsc}
          />

          {/* Section 5: Residence & Allocated Hub */}
          <ResidenceHubSection
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            pincode={pincode}
            setPincode={setPincode}
            allocatedHub={allocatedHub}
            setAllocatedHub={setAllocatedHub}
          />
        </ScrollView>

        {/* Pinned Bottom CTA Bar */}
        <EditProfileBottomBar
          bottomInset={insets.bottom}
          saving={saving}
          onClose={onClose}
          onSave={handleSave}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};
