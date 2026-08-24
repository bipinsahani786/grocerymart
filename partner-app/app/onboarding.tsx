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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

type OnboardingStep = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, completeKyc } = useAuthContext();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);

  // Step 1: Personal, Photo, Blood Group & Address
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Bellandur');
  const [pincode, setPincode] = useState('560103');
  const [city] = useState('Bengaluru');
  const [aadhaar, setAadhaar] = useState('4821 9904 8812');
  const [emergencyContact, setEmergencyContact] = useState('9876501234');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [riderPhotoUri, setRiderPhotoUri] = useState<string>(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  );
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'RIDER' | 'VEHICLE'>('RIDER');

  // Step 2: Vehicle & DL / RC (No insurance policy number)
  const [dlNumber, setDlNumber] = useState('KA0120220048210');
  const [dlExpiry, setDlExpiry] = useState('12/2034');
  const [rcNumber, setRcNumber] = useState('KA-01-EQ-4921');
  const [vehicleModel, setVehicleModel] = useState('Honda Activa 6G / Hero Splendor');
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState<string>(
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600'
  );

  // Step 3: Bank Account & Payouts
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Sahil');
  const [accountNumber, setAccountNumber] = useState('5010049218841');
  const [ifscCode, setIfscCode] = useState('HDFC0001248');
  const [panNumber, setPanNumber] = useState('ABCPS4821F');

  // Step 4: Verification Simulation
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

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
          aspect: [4, 3],
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
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        if (photoPickerTarget === 'RIDER') {
          setRiderPhotoUri(selectedUri);
        } else {
          setVehiclePhotoUri(selectedUri);
        }
      }
    } catch (err) {
      console.error('Error with device photo picker:', err);
      // Fallback
      if (photoPickerTarget === 'RIDER') {
        setRiderPhotoUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
      } else {
        setVehiclePhotoUri('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600');
      }
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!address.trim() || !pincode.trim() || !aadhaar.trim() || !emergencyContact.trim()) {
        setErrorMsg('Please fill all required personal & address fields');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!dlNumber.trim() || !rcNumber.trim() || !vehicleModel.trim()) {
        setErrorMsg('Please enter valid DL and vehicle details');
        return;
      }
      if (!vehiclePhotoUri) {
        setErrorMsg('Please capture or upload a vehicle front photo');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!accountNumber.trim() || !ifscCode.trim() || !panNumber.trim()) {
        setErrorMsg('Please complete bank payout & PAN details');
        return;
      }
      setIsVerifying(true);
      setTimeout(async () => {
        setIsVerifying(false);
        await completeKyc({
          address,
          pincode,
          city,
          aadhaarNumber: aadhaar,
          emergencyContact,
          dlNumber,
          dlExpiry,
          rcNumber,
          vehicleModel,
          bankHolderName: accountHolder,
          bankAccountNumber: accountNumber,
          bankIfsc: ifscCode,
          panNumber,
          profilePhotoUri: riderPhotoUri,
          vehiclePhotoUri: vehiclePhotoUri,
          allocatedHub: 'Koramangala Express Hub #04',
          riderId: 'RID-88421',
        });
        setCurrentStep(4);
      }, 1500);
    }
  };

  const stepsList = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Vehicle' },
    { num: 3, label: 'Bank' },
    { num: 4, label: 'Approval' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: Colors.surface }]}
    >
      <StatusBar style="dark" />

      {/* Native App Top Bar */}
      <View
        style={[
          tw`px-4 pb-3 border-b`,
          {
            backgroundColor: Colors.surface,
            borderBottomColor: Colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          {currentStep > 1 && currentStep < 4 ? (
            <TouchableOpacity
              onPress={() => setCurrentStep((prev) => (prev - 1) as OnboardingStep)}
              style={tw`p-1 -ml-1`}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={tw`w-6`} />
          )}

          <Text style={[tw`text-base font-extrabold`, { color: Colors.text }]}>
            Partner Registration
          </Text>

          <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
            {currentStep}/4
          </Text>
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
        {/* ================= STEP 1: PERSONAL, PHOTO, BLOOD GROUP & ADDRESS ================= */}
        {currentStep === 1 && (
          <View>
            <View style={tw`mb-4`}>
              <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
                Personal & Address Details
              </Text>
              <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
                Take or upload a clear photo of yourself and enter your emergency medical info.
              </Text>
            </View>

            {/* Profile Photo Row with Camera & Gallery Trigger */}
            <View style={[tw`flex-row items-center py-3.5 border-b`, { borderBottomColor: Colors.border }]}>
              <View style={tw`relative mr-3`}>
                <Image
                  source={{ uri: riderPhotoUri }}
                  style={[tw`w-14 h-14 rounded-full border-2`, { borderColor: Colors.primary }]}
                />
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
                <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>
                  Rider Profile Photo
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.primaryDark }]}>
                  Face match verified ✓
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
                  { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
                ]}
              >
                <Ionicons name="camera" size={13} color={Colors.primaryDark} style={tw`mr-1`} />
                <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
                  Upload Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Blood Group Selector */}
            <View style={[tw`py-3.5 border-b`, { borderBottomColor: Colors.border }]}>
              <View style={tw`flex-row justify-between items-center mb-1.5`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="water" size={14} color={Colors.danger} style={tw`mr-1`} />
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Blood Group (Emergency Insurance Record)
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
                  <Text style={[tw`text-sm font-semibold`, { color: Colors.text }]}>{city}</Text>
                </View>
              </View>

              {/* Aadhaar */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Aadhaar Card (12 Digits)
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.primaryDark }]}>
                    DigiLocker ✓
                  </Text>
                </View>
                <TextInput
                  value={aadhaar}
                  onChangeText={setAadhaar}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
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
              {/* DL Number */}
              <View style={[tw`py-3 border-b`, { borderBottomColor: Colors.border }]}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Driving License (DL) Number
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.primaryDark }]}>
                    Active
                  </Text>
                </View>
                <TextInput
                  value={dlNumber}
                  onChangeText={setDlNumber}
                  placeholder="e.g. KA0120220048210"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* DL Expiry & RC Number */}
              <View style={[tw`flex-row border-b`, { borderBottomColor: Colors.border }]}>
                <View style={[tw`flex-1 py-3 pr-2 border-r`, { borderRightColor: Colors.border }]}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                    DL Expiry
                  </Text>
                  <TextInput
                    value={dlExpiry}
                    onChangeText={setDlExpiry}
                    placeholder="MM/YYYY"
                    placeholderTextColor={Colors.textMuted}
                    style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                  />
                </View>

                <View style={tw`flex-1 py-3 pl-3`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                    Vehicle Number (RC)
                  </Text>
                  <TextInput
                    value={rcNumber}
                    onChangeText={setRcNumber}
                    placeholder="KA-01-EQ-4921"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                  />
                </View>
              </View>

              {/* Vehicle Model */}
              <View style={[tw`py-3 border-b mb-4`, { borderBottomColor: Colors.border }]}>
                <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1`, { color: Colors.textSecondary }]}>
                  Vehicle Make & Model
                </Text>
                <TextInput
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  placeholder="e.g. Ather 450X / Hero Splendor / Honda Activa"
                  placeholderTextColor={Colors.textMuted}
                  style={[tw`text-sm font-semibold p-0`, { color: Colors.text }]}
                />
              </View>

              {/* ================= VEHICLE FRONT PHOTO & PREVIEW SECTION ================= */}
              <View style={tw`mb-3`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                    Vehicle Front Photo Preview
                  </Text>
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.primaryDark }]}>
                    VAHAN Plate Match ✓
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
                  <Text style={[tw`text-[10px] font-bold`, { color: Colors.blue }]}>
                    HDFC Bank • Koramangala
                  </Text>
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
                Welcome to GroceryMart fleet, {user?.name || 'Partner'}! You are ready to start delivering.
              </Text>
            </View>

            {/* Summary Detail Rows */}
            <View style={[tw`border-t border-b py-2 mb-4`, { borderColor: Colors.border }]}>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Assigned Dark Store</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>Koramangala Hub #04</Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Rider Partner ID</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.primaryDark }]}>RID-88421</Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Blood Group</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.danger }]}>{bloodGroup}</Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Vehicle</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>{rcNumber}</Text>
              </View>
              <View style={tw`flex-row justify-between py-2`}>
                <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>Payout Account</Text>
                <Text style={[tw`text-xs font-extrabold`, { color: Colors.text }]}>HDFC Bank (****8841)</Text>
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
                {photoPickerTarget === 'RIDER' ? 'Upload Rider Photo' : 'Upload Vehicle Front Photo'}
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
