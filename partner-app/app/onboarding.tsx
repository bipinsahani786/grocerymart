import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../context/AuthContext';
import { partnerAuthService } from '../services/partnerAuth.service';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  validateAadhaarNumber,
  validateDlNumber,
  validateDlExpiry,
  validateRcNumber,
  validateVehicleModel,
  validatePan,
  validateIfsc,
  validateBankAccount,
  formatExpiryDate,
  formatDlNumber,
  formatRcNumber,
} from '../utils/validation';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

type OnboardingStep = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, completeKyc } = useAuthContext();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);

  // Step 1: Personal, Profile Photo, Blood Group & Address
  const [fullName, setFullName] = useState(
    user?.name && !['Delivery Captain', 'Delivery Partner', 'New Captain', 'Rajesh Kumar Verma'].includes(user.name)
      ? user.name
      : ''
  );
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [riderPhotoUri, setRiderPhotoUri] = useState<string>(
    user?.avatar && !user.avatar.includes('unsplash') ? user.avatar : ''
  );
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'RIDER' | 'VEHICLE'>('RIDER');

  // Step 2: Vehicle & DL / RC
  const [vehicleType, setVehicleType] = useState<'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE'>('EV_BIKE');
  const [dlNumber, setDlNumber] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expiryDateValue, setExpiryDateValue] = useState<Date>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    return d;
  });

  // Step 3: Bank Account & Payouts
  const [accountHolder, setAccountHolder] = useState(
    user?.name && !['Delivery Captain', 'Delivery Partner', 'New Captain', 'Rajesh Kumar Verma'].includes(user.name)
      ? user.name
      : ''
  );
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // Step 4: Verification Simulation
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const vehicleOptions = [
    { id: 'EV_BIKE', label: 'EV 2-Wheeler', sub: 'Electric (Ather, Ola, etc.)', icon: 'flash' },
    { id: 'PETROL_BIKE', label: 'Motorcycle', sub: 'Petrol Bike (Splendor, Pulsar)', icon: 'speedometer' },
    { id: 'SCOOTER', label: 'Scooter / Moped', sub: 'Gearless (Activa, Jupiter)', icon: 'bicycle' },
    { id: 'CYCLE', label: 'E-Cycle / Bicycle', sub: 'Green & Fast Fleet', icon: 'leaf' },
  ];

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate && (event.type === 'set' || Platform.OS === 'ios')) {
      setExpiryDateValue(selectedDate);
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const yyyy = selectedDate.getFullYear();
      setDlExpiry(`${mm}/${yyyy}`);
      setErrorMsg('');
    }
  };

  const handleSelectPhotoSource = async (source: 'CAMERA' | 'GALLERY') => {
    setShowPhotoPickerModal(false);
    try {
      let result;
      if (source === 'CAMERA') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setErrorMsg('Camera permission is required to capture photo');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setErrorMsg('Gallery permission is required to choose photo');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        if (photoPickerTarget === 'RIDER') {
          setRiderPhotoUri(localUri);
        } else {
          setVehiclePhotoUri(localUri);
        }

        // Upload to Cloudflare R2 and update state with persistent R2 storage URL
        try {
          const r2Url = await partnerAuthService.uploadImage(localUri, token);
          if (r2Url && r2Url !== localUri) {
            if (photoPickerTarget === 'RIDER') {
              setRiderPhotoUri(r2Url);
            } else {
              setVehiclePhotoUri(r2Url);
            }
          }
        } catch (uploadErr) {
          console.warn('Background Cloudflare R2 upload error:', uploadErr);
        }
      }
    } catch (err) {
      console.error('Error with photo picker:', err);
      setErrorMsg('Could not load photo. Please try again.');
    }
  };

  const handleNextStep = async () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!riderPhotoUri) {
        setErrorMsg('Please upload a clear profile photo (Compulsory)');
        return;
      }
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (!bloodGroup.trim()) {
        setErrorMsg('Please select your blood group');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('Please enter your residential address');
        return;
      }
      if (!pincode.trim() || pincode.trim().length !== 6) {
        setErrorMsg('Please enter a valid 6-digit PIN code');
        return;
      }
      if (!city.trim()) {
        setErrorMsg('Please enter your city');
        return;
      }
      const aadhaarVal = validateAadhaarNumber(aadhaar);
      if (!aadhaarVal.isValid) {
        setErrorMsg(aadhaarVal.error || 'Aadhaar number must be exactly 12 numeric digits');
        return;
      }
      if (!emergencyContact.trim() || emergencyContact.trim().length !== 10) {
        setErrorMsg('Please enter a valid 10-digit emergency contact number');
        return;
      }
      // Sync account holder name with full name if blank
      if (!accountHolder) {
        setAccountHolder(fullName.trim());
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const dlVal = validateDlNumber(dlNumber);
      if (!dlVal.isValid) {
        setErrorMsg(dlVal.error || 'Please enter a valid Driving License number');
        return;
      }
      const expiryVal = validateDlExpiry(dlExpiry);
      if (!expiryVal.isValid) {
        setErrorMsg(expiryVal.error || 'Please enter a valid DL expiry date (MM/YYYY)');
        return;
      }
      const rcVal = validateRcNumber(rcNumber);
      if (!rcVal.isValid) {
        setErrorMsg(rcVal.error || 'Please enter a valid Vehicle RC number');
        return;
      }
      const modelVal = validateVehicleModel(vehicleModel);
      if (!modelVal.isValid) {
        setErrorMsg(modelVal.error || 'Please enter your vehicle make and model');
        return;
      }
      if (!vehiclePhotoUri) {
        setErrorMsg('Please capture or upload a vehicle front photo (Compulsory)');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const bankVal = validateBankAccount(accountNumber);
      if (!bankVal.isValid) {
        setErrorMsg(bankVal.error || 'Please enter a valid bank account number (9 to 18 digits)');
        return;
      }
      const ifscVal = validateIfsc(ifscCode);
      if (!ifscVal.isValid) {
        setErrorMsg(ifscVal.error || 'Please enter a valid 11-character IFSC code (e.g. HDFC0001248)');
        return;
      }
      const panVal = validatePan(panNumber);
      if (!panVal.isValid) {
        setErrorMsg(panVal.error || 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F)');
        return;
      }
      setIsVerifying(true);
      setErrorMsg('');
      try {
        await completeKyc({
          name: fullName.trim(),
          address: address.trim(),
          pincode: pincode.trim(),
          city: city.trim(),
          aadhaarNumber: aadhaar.trim(),
          emergencyContact: emergencyContact.trim(),
          bloodGroup: bloodGroup.trim(),
          dlNumber: dlNumber.trim().toUpperCase(),
          dlExpiry: dlExpiry.trim(),
          rcNumber: rcNumber.trim().toUpperCase(),
          vehicleModel: vehicleModel.trim(),
          vehicleType,
          bankHolderName: (accountHolder || fullName).trim(),
          bankAccountNumber: bankVal.cleanValue,
          bankIfsc: ifscVal.cleanValue,
          panNumber: panVal.cleanValue,
          profilePhotoUri: riderPhotoUri,
          vehiclePhotoUri: vehiclePhotoUri,
          allocatedHub: city.trim() ? `${city.trim()} Central Hub` : 'Central Hub',
        });
        setCurrentStep(4);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to save KYC details to backend. Please check fields and try again.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const stepsList = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Vehicle' },
    { num: 3, label: 'Bank' },
    { num: 4, label: 'Approval' },
  ];

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/login');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: Colors.surface }]}
    >
      <RNStatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <StatusBar style="dark" />

      {/* Native App Top Bar */}
      <View
        style={[
          tw`px-4 pb-2.5 border-b`,
          {
            backgroundColor: Colors.surface,
            borderBottomColor: Colors.border,
            paddingTop: Platform.OS === 'ios' ? Math.max(insets.top - 12, 8) : 8,
          },
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleBack}
            style={tw`p-1 -ml-1`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={[tw`text-base font-extrabold`, { color: Colors.text }]}>
            Partner Registration
          </Text>

          <View style={tw`flex-row items-center gap-2`}>
            <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
              {currentStep}/4
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (user) {
                  router.replace('/home');
                } else {
                  router.replace('/login');
                }
              }}
              style={[
                tw`px-2.5 py-1 rounded-full`,
                { backgroundColor: Colors.surfaceLight, borderColor: Colors.border, borderWidth: 1 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[tw`text-[11px] font-bold`, { color: Colors.textSecondary }]}>
                {user ? 'Home' : 'Main'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Native Segmented Progress Bar */}
        <View style={tw`flex-row gap-1.5 mt-3`}>
          {stepsList.map((st) => (
            <View
              key={st.num}
              style={[
                tw`flex-1 h-1 rounded-full`,
                {
                  backgroundColor:
                    currentStep >= st.num ? Colors.primary : Colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pt-4 pb-28`}
      >
        {/* ================= STEP 1: PERSONAL, USER PROFILE, BLOOD GROUP & ADDRESS ================= */}
        {currentStep === 1 && (
          <View>
            <View style={tw`mb-4`}>
              <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
                Personal & Address Details
              </Text>
              <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
                Enter your full name, blood group, address and identity details.
              </Text>
            </View>

            {/* Delivery Partner Avatar Header Badge & Photo Upload (Compulsory) */}
            <View
              style={[
                tw`flex-row items-center p-3.5 rounded-2xl border mb-3.5`,
                {
                  backgroundColor: Colors.surfaceLight,
                  borderColor: !riderPhotoUri && errorMsg ? Colors.danger : Colors.border,
                },
              ]}
            >
              <View style={tw`relative mr-3`}>
                {riderPhotoUri ? (
                  <Image
                    source={{ uri: riderPhotoUri }}
                    style={[tw`w-14 h-14 rounded-full border-2`, { borderColor: Colors.primary }]}
                  />
                ) : (
                  <View
                    style={[
                      tw`w-14 h-14 rounded-full border-2 border-dashed justify-center items-center`,
                      { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
                    ]}
                  >
                    <Ionicons name="person" size={26} color={Colors.primaryDark} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setPhotoPickerTarget('RIDER');
                    setShowPhotoPickerModal(true);
                  }}
                  style={[
                    tw`absolute bottom-0 right-0 w-5 h-5 rounded-full justify-center items-center shadow-md`,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <Ionicons name="camera" size={11} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={tw`flex-1 mr-2`}>
                <View style={tw`flex-row items-center`}>
                  <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
                    Rider Profile Photo
                  </Text>
                  <Text style={[tw`text-[10px] font-bold ml-1.5`, { color: Colors.danger }]}>
                    Compulsory *
                  </Text>
                </View>
                <Text
                  style={[
                    tw`text-[11px] mt-0.5`,
                    { color: riderPhotoUri ? Colors.primaryDark : Colors.textSecondary },
                  ]}
                >
                  {riderPhotoUri ? 'Photo uploaded ✓' : 'Clear selfie/front photo required'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setPhotoPickerTarget('RIDER');
                  setShowPhotoPickerModal(true);
                }}
                style={[
                  tw`px-3 py-1.5 rounded-xl border flex-row items-center`,
                  {
                    backgroundColor: riderPhotoUri ? Colors.surfaceLight : Colors.primaryBg,
                    borderColor: Colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="camera"
                  size={13}
                  color={Colors.primaryDark}
                  style={tw`mr-1`}
                />
                <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
                  {riderPhotoUri ? 'Change' : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name Input */}
            <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
              <View style={tw`flex-row justify-between items-center mb-1`}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                  Full Name (As per Govt ID)
                </Text>
                <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                  Required *
                </Text>
              </View>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full legal name"
                placeholderTextColor={Colors.textMuted}
                style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
              />
            </View>

            {/* Blood Group Selector */}
            <View style={[tw`py-3.5 border-b`, { borderBottomColor: Colors.border }]}>
              <View style={tw`flex-row justify-between items-center mb-1.5`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="water" size={14} color={Colors.danger} style={tw`mr-1`} />
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Blood Group (Emergency Record)
                  </Text>
                </View>
                <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                  Required *
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-2 py-1`}>
                {bloodGroups.map((bg) => {
                  const isSelected = bloodGroup === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      activeOpacity={0.8}
                      onPress={() => setBloodGroup(bg)}
                      style={[
                        tw`px-3.5 py-1.5 rounded-xl border items-center justify-center`,
                        {
                          backgroundColor: isSelected ? Colors.dangerLight : Colors.surfaceLight,
                          borderColor: isSelected ? Colors.danger : Colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          tw`text-xs font-extrabold`,
                          { color: isSelected ? Colors.danger : Colors.text },
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Native Form Field List */}
            <View style={tw`mt-1`}>
              {/* Address */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  Residential Address
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="House, Street, Area"
                  placeholderTextColor={Colors.textMuted}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* Pincode & City */}
              <View style={[tw`flex-row border-b`, { borderBottomColor: Colors.border }]}>
                <View style={[tw`flex-1 py-3 pr-2 border-r`, { borderRightColor: Colors.border }]}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                    PIN Code
                  </Text>
                  <TextInput
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="6 Digits"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                  />
                </View>

                <View style={tw`flex-1 py-3 pl-3`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                    City
                  </Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Bengaluru"
                    placeholderTextColor={Colors.textMuted}
                    style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                  />
                </View>
              </View>

              {/* Aadhaar */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Aadhaar Card (12 Digits)
                  </Text>
                  <Text
                    style={[
                      tw`text-[10px] font-bold`,
                      { color: aadhaar.length === 12 ? Colors.primaryDark : Colors.textSecondary },
                    ]}
                  >
                    {aadhaar.length}/12 Digits
                  </Text>
                </View>
                <TextInput
                  value={aadhaar}
                  onChangeText={(txt) => {
                    const clean = txt.replace(/\D/g, '').slice(0, 12);
                    setAadhaar(clean);
                    setErrorMsg('');
                  }}
                  placeholder="12-digit Aadhaar number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={12}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* Emergency Contact */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  Emergency Family Contact
                </Text>
                <TextInput
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>
            </View>
          </View>
        )}

        {/* ================= STEP 2: VEHICLE & DRIVING LICENSE ================= */}
        {currentStep === 2 && (
          <View>
            <View style={tw`mb-4`}>
              <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
                Vehicle & License Details
              </Text>
              <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
                Provide your driving license, registration specs and upload a front photo of your vehicle.
              </Text>
            </View>

            <View style={tw`mt-1`}>
              {/* Vehicle Type Selector */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Vehicle Type
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                    Required *
                  </Text>
                </View>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {vehicleOptions.map((v) => {
                    const isSelected = vehicleType === v.id;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        activeOpacity={0.8}
                        onPress={() => setVehicleType(v.id as any)}
                        style={[
                          tw`p-2.5 rounded-2xl border flex-row items-center`,
                          {
                            width: '48%',
                            backgroundColor: isSelected ? Colors.primaryBg : Colors.surfaceLight,
                            borderColor: isSelected ? Colors.primary : Colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            tw`w-8 h-8 rounded-xl justify-center items-center mr-2`,
                            { backgroundColor: isSelected ? Colors.primary : Colors.white },
                          ]}
                        >
                          <Ionicons
                            name={v.icon as any}
                            size={16}
                            color={isSelected ? Colors.white : Colors.primaryDark}
                          />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text
                            style={[
                              tw`text-xs font-black`,
                              { color: isSelected ? Colors.primaryDark : Colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {v.label}
                          </Text>
                          <Text style={[tw`text-[10px]`, { color: Colors.textSecondary }]} numberOfLines={1}>
                            {v.sub}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* DL Number */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Driving License (DL) Number
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                    Required *
                  </Text>
                </View>
                <TextInput
                  value={dlNumber}
                  onChangeText={(txt) => {
                    setDlNumber(formatDlNumber(txt));
                    setErrorMsg('');
                  }}
                  placeholder="e.g. KA0120220048210"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={20}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* DL Expiry & RC Number */}
              <View style={[tw`flex-row border-b`, { borderBottomColor: Colors.border }]}>
                <View style={[tw`flex-1 py-3 pr-2 border-r`, { borderRightColor: Colors.border }]}>
                  <View style={tw`flex-row justify-between items-center mb-1`}>
                    <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                      DL Expiry (Calendar)
                    </Text>
                    <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                      *
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center justify-between`}>
                    <TextInput
                      value={dlExpiry}
                      onChangeText={(txt) => {
                        setDlExpiry(formatExpiryDate(txt));
                        setErrorMsg('');
                      }}
                      placeholder="MM/YYYY"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={7}
                      style={[tw`text-sm font-semibold p-0 flex-1`, { color: Colors.text }]}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowDatePicker(true)}
                      style={[
                        tw`p-1.5 rounded-lg ml-1 items-center justify-center border`,
                        { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
                      ]}
                    >
                      <Ionicons name="calendar-outline" size={15} color={Colors.primaryDark} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={tw`flex-1 py-3 pl-3`}>
                  <View style={tw`flex-row justify-between items-center mb-1`}>
                    <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                      Vehicle RC No.
                    </Text>
                    <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                      *
                    </Text>
                  </View>
                  <TextInput
                    value={rcNumber}
                    onChangeText={(txt) => {
                      setRcNumber(formatRcNumber(txt));
                      setErrorMsg('');
                    }}
                    placeholder="KA01EQ4921"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    maxLength={15}
                    style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                  />
                </View>
              </View>

              {/* DateTimePicker Component for DL Expiry Calendar */}
              {showDatePicker && (
                Platform.OS === 'ios' ? (
                  <Modal transparent animationType="fade" visible={showDatePicker}>
                    <View style={[tw`flex-1 justify-end`, { backgroundColor: Colors.overlay }]}>
                      <View style={[tw`p-4 rounded-t-3xl border-t`, { backgroundColor: Colors.surface, borderTopColor: Colors.border }]}>
                        <View style={tw`flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100`}>
                          <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>Select DL Expiry Date</Text>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={[tw`px-3 py-1.5 rounded-xl`, { backgroundColor: Colors.primary }]}
                          >
                            <Text style={[tw`text-xs font-bold`, { color: Colors.white }]}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={expiryDateValue}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 30))}
                          onChange={handleDateChange}
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={expiryDateValue}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 30))}
                    onChange={handleDateChange}
                  />
                )
              )}

              {/* Vehicle Model */}
              <View style={[tw`py-3 border-b mb-4`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Vehicle Make & Model
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                    Required *
                  </Text>
                </View>
                <TextInput
                  value={vehicleModel}
                  onChangeText={(txt) => {
                    setVehicleModel(txt);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Hero Splendor / Honda Activa / Ather 450X"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={50}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* ================= VEHICLE FRONT PHOTO & PREVIEW SECTION ================= */}
              <View style={tw`mb-3`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Vehicle Front Photo Preview
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.danger }]}>
                    Compulsory *
                  </Text>
                </View>

                {vehiclePhotoUri ? (
                  /* Live Vehicle Image Preview Container */
                  <View style={[tw`rounded-3xl border overflow-hidden shadow-sm`, { borderColor: Colors.primary }]}>
                    <Image
                      source={{ uri: vehiclePhotoUri }}
                      style={tw`w-full h-44`}
                      resizeMode="cover"
                    />

                    {/* Preview overlay bottom bar */}
                    <View
                      style={[
                        tw`flex-row items-center justify-between p-3 border-t`,
                        { backgroundColor: Colors.surface, borderTopColor: Colors.border },
                      ]}
                    >
                      <View style={tw`flex-row items-center flex-1 mr-2`}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} style={tw`mr-1.5`} />
                        <Text style={[tw`text-xs font-bold`, { color: Colors.text }]} numberOfLines={1}>
                          {rcNumber} (Front View)
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setPhotoPickerTarget('VEHICLE');
                          setShowPhotoPickerModal(true);
                        }}
                        style={[
                          tw`px-3 py-1.5 rounded-xl border flex-row items-center`,
                          { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
                        ]}
                      >
                        <Ionicons name="camera" size={13} color={Colors.primaryDark} style={tw`mr-1`} />
                        <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
                          Change Photo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* Upload Placeholder if empty */
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setPhotoPickerTarget('VEHICLE');
                      setShowPhotoPickerModal(true);
                    }}
                    style={[
                      tw`p-6 rounded-3xl border-2 border-dashed items-center justify-center`,
                      { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
                    ]}
                  >
                    <View
                      style={[
                        tw`w-12 h-12 rounded-2xl justify-center items-center mb-2`,
                        { backgroundColor: Colors.white },
                      ]}
                    >
                      <Ionicons name="camera" size={24} color={Colors.primaryDark} />
                    </View>
                    <Text style={[tw`text-sm font-black`, { color: Colors.primaryDark }]}>
                      Upload Vehicle Front Photo
                    </Text>
                    <Text style={[tw`text-xs text-center mt-1`, { color: Colors.textSecondary }]}>
                      Ensure front number plate and vehicle model are clearly visible
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ================= STEP 3: BANK ACCOUNT & PAYOUTS ================= */}
        {currentStep === 3 && (
          <View>
            <View style={tw`mb-4`}>
              <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
                Bank & Payout Setup
              </Text>
              <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
                All daily trip earnings and tips are settled directly to this bank account.
              </Text>
            </View>

            <View style={tw`mt-1`}>
              {/* Account Holder */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  Account Holder Name
                </Text>
                <TextInput
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textMuted}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* Account Number */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  Bank Account Number
                </Text>
                <TextInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="11 to 16 Digit Account No."
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* IFSC Code */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    IFSC Code
                  </Text>
                  {ifscCode.length >= 4 && (
                    <Text style={[tw`text-[10px] font-bold`, { color: Colors.blue }]}>
                      {ifscCode.slice(0, 4).toUpperCase()} Bank
                    </Text>
                  )}
                </View>
                <TextInput
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  placeholder="HDFC0001248"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={11}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* PAN Number */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  PAN Card (For Daily Settlement)
                </Text>
                <TextInput
                  value={panNumber}
                  onChangeText={setPanNumber}
                  placeholder="10-digit PAN (e.g. ABCPS4821F)"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={10}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>
            </View>

            {/* Instant IMPS badge */}
            <View style={[tw`flex-row items-center py-3.5 mt-2`]}>
              <Ionicons name="flash" size={16} color={Colors.primaryDark} style={tw`mr-2`} />
              <Text style={[tw`text-xs font-semibold flex-1`, { color: Colors.textSecondary }]}>
                Instant zero-fee IMPS daily transfers enabled 24x7.
              </Text>
            </View>
          </View>
        )}

        {/* ================= STEP 4: APPROVAL ================= */}
        {currentStep === 4 && (
          <View style={tw`pt-2`}>
            {/* Header Success State */}
            <View style={tw`items-center mb-6`}>
              <View
                style={[
                  tw`w-16 h-16 rounded-full justify-center items-center mb-3 shadow-md`,
                  { backgroundColor: Colors.primaryBg },
                ]}
              >
                <Ionicons name="checkmark-done" size={36} color={Colors.primary} />
              </View>
              <Text style={[tw`text-2xl font-black text-center`, { color: Colors.text }]}>
                Verification Approved!
              </Text>
              <Text style={[tw`text-xs text-center mt-1 max-w-[270px]`, { color: Colors.textSecondary }]}>
                Welcome to GroceryMart fleet{fullName.trim() ? `, ${fullName.trim()}` : ''}! You are ready to start delivering.
              </Text>
            </View>

            {/* Summary Detail Rows */}
            <View style={[tw`border-t border-b py-2 mb-4`, { borderColor: Colors.border }]}>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Assigned Dark Store</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>
                  {city.trim() ? `${city.trim()} Central Hub` : 'Central Hub'}
                </Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Rider Partner ID</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.primaryDark }]}>
                  {user?.id ? `RID-${user.id.slice(-6).toUpperCase()}` : 'RID-PARTNER'}
                </Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Blood Group</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.danger }]}>{bloodGroup || 'Not Specified'}</Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Vehicle</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>
                  {rcNumber} • {vehicleType.replace('_', ' ')}
                </Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Payout Account</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>
                  {ifscCode ? `${ifscCode.slice(0, 4)} Bank (****${accountNumber.slice(-4)})` : accountNumber ? `Account (****${accountNumber.slice(-4)})` : 'Verified'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {errorMsg ? (
          <Text style={[tw`text-xs text-center my-2`, { color: Colors.danger }]}>
            {errorMsg}
          </Text>
        ) : null}
      </ScrollView>

      {/* ================= CAMERA / GALLERY PHOTO PICKER MODAL ================= */}
      <Modal
        visible={showPhotoPickerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPhotoPickerModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowPhotoPickerModal(false)}
          style={[tw`flex-1 justify-end`, { backgroundColor: Colors.overlay }]}
        >
          <View
            style={[
              tw`rounded-t-3xl p-5 border-t shadow-2xl`,
              {
                backgroundColor: Colors.surface,
                borderTopColor: Colors.border,
                paddingBottom: Math.max(insets.bottom, 16) + 10,
              },
            ]}
          >
            <View style={tw`flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100`}>
              <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
                {photoPickerTarget === 'RIDER' ? 'Upload Rider Profile Photo' : 'Upload Vehicle Front Photo'}
              </Text>
              <TouchableOpacity onPress={() => setShowPhotoPickerModal(false)}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={tw`gap-2.5`}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSelectPhotoSource('CAMERA')}
                style={[
                  tw`flex-row items-center p-4 rounded-2xl border`,
                  { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
                ]}
              >
                <View
                  style={[
                    tw`w-10 h-10 rounded-xl justify-center items-center mr-3`,
                    { backgroundColor: Colors.primaryBg },
                  ]}
                >
                  <Ionicons name="camera" size={20} color={Colors.primaryDark} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>
                    Take Photo with Camera
                  </Text>
                  <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
                    Capture live photo using device camera
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSelectPhotoSource('GALLERY')}
                style={[
                  tw`flex-row items-center p-4 rounded-2xl border`,
                  { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
                ]}
              >
                <View
                  style={[
                    tw`w-10 h-10 rounded-xl justify-center items-center mr-3`,
                    { backgroundColor: Colors.blueLight },
                  ]}
                >
                  <Ionicons name="images" size={20} color={Colors.blue} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>
                    Choose from Gallery
                  </Text>
                  <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
                    Upload a saved image from your photo library
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Native Pinned Bottom Action Sheet Bar */}
      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 px-4 pt-3 border-t`,
          {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            paddingBottom: Math.max(insets.bottom, 12) + 6,
          },
        ]}
      >
        {currentStep < 4 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNextStep}
            style={[
              tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Text style={[tw`text-sm font-black mr-2 tracking-wide`, { color: Colors.white }]}>
              {isVerifying
                ? 'VERIFYING WITH DIGILOCKER...'
                : currentStep === 3
                  ? 'SUBMIT & GET APPROVED'
                  : 'CONTINUE'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace('/home')}
            style={[
              tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Text style={[tw`text-sm font-black mr-2 tracking-wide`, { color: Colors.white }]}>
              GO TO PARTNER DASHBOARD
            </Text>
            <Ionicons name="speedometer" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
