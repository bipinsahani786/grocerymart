import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'EN' | 'HI' | 'KN';

export interface LanguageTranslations {
  // Common / Header
  home: string;
  activeDelivery: string;
  trips: string;
  earnings: string;
  profile: string;
  officialId: string;
  activeVerified: string;
  onDuty: string;
  goOnline: string;
  koramangalaHub: string;
  cancel: string;
  active: string;
  verified: string;
  
  // Home Cockpit
  activeOrderHeading: string;
  enRouteCustomer: string;
  atDarkStore: string;
  trackOrder: string;
  waitingOrders: string;
  priorityRadarActive: string;
  tripsDone: string;
  shiftTime: string;
  codCash: string;
  dailyQuest: string;
  questBonus: string;
  deposit: string;
  sos: string;
  wallet: string;
  testOrder: string;

  // Active Delivery Cockpit
  stepGoStore: string;
  stepAtStore: string;
  stepEnRoute: string;
  tripEarning: string;
  pickupRack: string;
  pickupHub: string;
  customerDrop: string;
  itemsChecklist: string;
  verifyAll: string;
  arrivedAtDarkStore: string;
  confirmPickupStart: string;
  arrivedDoorstepVerifyOtp: string;
  collectCash: string;
  prepaidOrder: string;

  // Trips History
  tripHistoryTitle: string;
  completedDeliveries: string;
  totalEarned: string;
  tripsDelivered: string;
  avgPerOrder: string;
  all: string;
  today: string;
  week: string;
  month: string;
  noTripsYet: string;
  completedStatus: string;

  // Earnings Dashboard
  availableBalance: string;
  instantImps: string;
  floatingCodCash: string;
  instantCashout: string;
  depositCashBtn: string;
  thisWeek: string;
  thisMonth: string;
  tipsEarned: string;
  weeklyIncomeTrend: string;
  incomeLedger: string;

  // My Profile
  lifetimeTrips: string;
  onTimeRate: string;
  partnerTier: string;
  fleetVerification: string;
  registeredVehicle: string;
  kycLicense: string;
  medicalInsurance: string;
  preferencesApp: string;
  allSettings: string;
  orderSiren: string;
  autoNav: string;
  appLanguage: string;
  safetyAccount: string;
  safetySOS: string;
  logout: string;
  confirmLogoutTitle: string;
  confirmLogoutDesc: string;

  // Modals & Settings
  chatWith: string;
  quickReplies: string;
  typeMessage: string;
  depositCodCashTitle: string;
  upiApps: string;
  storeQrCode: string;
  cashVault: string;
  payAndClear: string;
  verifyDoorstepOtp: string;
  autoFill: string;
}

const translations: Record<LanguageCode, LanguageTranslations> = {
  EN: {
    home: 'Home',
    activeDelivery: 'Active Delivery',
    trips: 'Trips',
    earnings: 'Earnings',
    profile: 'Profile',
    officialId: 'OFFICIAL DELIVERY PARTNER ID',
    activeVerified: 'ACTIVE & VERIFIED',
    onDuty: 'ON DUTY',
    goOnline: 'GO ONLINE',
    koramangalaHub: 'Koramangala Dark Store #04',
    cancel: 'Cancel',
    active: 'Active',
    verified: 'Verified',

    activeOrderHeading: 'Active Delivery',
    enRouteCustomer: 'En Route to Customer',
    atDarkStore: 'At Dark Store Pickup',
    trackOrder: 'Track ➔',
    waitingOrders: 'Waiting for instant nearby orders...',
    priorityRadarActive: '⚡ Priority Radar Active',
    tripsDone: 'TRIPS DONE',
    shiftTime: 'SHIFT TIME',
    codCash: 'COD CASH',
    dailyQuest: 'Daily Milestone Quest (14/20 Orders)',
    questBonus: '+₹250 Bonus',
    deposit: 'Deposit',
    sos: 'SOS 24/7',
    wallet: 'Wallet',
    testOrder: '+ Test',

    stepGoStore: 'STEP 1: GO TO DARK STORE',
    stepAtStore: 'STEP 1: AT DARK STORE',
    stepEnRoute: 'STEP 2: EN ROUTE TO CUSTOMER',
    tripEarning: 'TRIP EARNING',
    pickupRack: 'Pickup Rack #B-04 • Shelf 2',
    pickupHub: 'Pickup Hub',
    customerDrop: 'Customer Drop',
    itemsChecklist: 'Items Checklist',
    verifyAll: 'Verify All',
    arrivedAtDarkStore: 'ARRIVED AT DARK STORE',
    confirmPickupStart: 'CONFIRM PICKUP & START TRIP',
    arrivedDoorstepVerifyOtp: 'ARRIVED AT DOORSTEP & VERIFY OTP',
    collectCash: 'Collect Cash',
    prepaidOrder: 'Prepaid Order',

    tripHistoryTitle: 'Trip History',
    completedDeliveries: 'Completed Deliveries',
    totalEarned: 'TOTAL EARNED',
    tripsDelivered: 'TRIPS DELIVERED',
    avgPerOrder: 'AVG / ORDER',
    all: 'All',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    noTripsYet: 'No Trips Recorded Yet',
    completedStatus: 'Completed ✓',

    availableBalance: 'AVAILABLE BALANCE',
    instantImps: 'INSTANT IMPS 24x7',
    floatingCodCash: 'Floating COD Cash',
    instantCashout: 'INSTANT CASHOUT',
    depositCashBtn: 'DEPOSIT CASH',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    tipsEarned: 'TIPS EARNED',
    weeklyIncomeTrend: 'Weekly Income Trend',
    incomeLedger: 'Income & Settlement Ledger',

    lifetimeTrips: 'Lifetime Trips',
    onTimeRate: 'On-Time Rate',
    partnerTier: 'Gold Pro Partner',
    fleetVerification: 'FLEET & VERIFICATION',
    registeredVehicle: 'Registered Delivery Vehicle',
    kycLicense: 'KYC & Driving License',
    medicalInsurance: 'Medical & Accident Cover',
    preferencesApp: 'PREFERENCES & APP',
    allSettings: 'All Settings & Preferences',
    orderSiren: 'Order Alert Siren',
    autoNav: 'Auto Google Maps Navigation',
    appLanguage: 'App Language',
    safetyAccount: 'SAFETY & ACCOUNT',
    safetySOS: 'Safety Center & 24/7 Emergency SOS',
    logout: 'Logout',
    confirmLogoutTitle: 'Confirm Logout',
    confirmLogoutDesc: 'Are you sure you want to go offline and log out of your delivery partner account?',

    chatWith: 'Chat with Customer',
    quickReplies: '1-TAP QUICK REPLIES',
    typeMessage: 'Type custom update...',
    depositCodCashTitle: 'Deposit COD Cash',
    upiApps: 'Instant UPI Apps (GPay, PhonePe)',
    storeQrCode: 'Dynamic Store QR Code',
    cashVault: 'Dark Store Cash Vault Handover',
    payAndClear: 'PAY & CLEAR DUES',
    verifyDoorstepOtp: 'Verify Doorstep OTP',
    autoFill: 'Auto-Fill',
  },
  HI: {
    home: 'होम',
    activeDelivery: 'लाइव ऑर्डर',
    trips: 'ट्रिप्स',
    earnings: 'कमाई',
    profile: 'प्रोफाइल',
    officialId: 'आधिकारिक डिलीवरी पार्टनर आईडी',
    activeVerified: 'सक्रिय एवं सत्यापित',
    onDuty: 'ऑन ड्यूटी',
    goOnline: 'ऑनलाइन जाएं',
    koramangalaHub: 'कोरमंगला डार्क स्टोर #04',
    cancel: 'रद्द करें',
    active: 'सक्रिय',
    verified: 'सत्यापित',

    activeOrderHeading: 'सक्रिय डिलीवरी ऑर्डर',
    enRouteCustomer: 'ग्राहक के पते पर जा रहे हैं',
    atDarkStore: 'डार्क स्टोर पिकअप पर हैं',
    trackOrder: 'ट्रैक करें ➔',
    waitingOrders: 'आस-पास के नए ऑर्डर का इंतजार है...',
    priorityRadarActive: '⚡ प्राथमिकता रडार सक्रिय',
    tripsDone: 'कुल ट्रिप्स',
    shiftTime: 'शिफ्ट समय',
    codCash: 'नकद संग्रह',
    dailyQuest: 'दैनिक लक्ष्य (14/20 ऑर्डर पूरे)',
    questBonus: '+₹250 बोनस',
    deposit: 'जमा करें',
    sos: 'सुरक्षा SOS',
    wallet: 'वॉलेट',
    testOrder: '+ टेस्ट ऑर्डर',

    stepGoStore: 'चरण 1: डार्क स्टोर पर जाएं',
    stepAtStore: 'चरण 1: डार्क स्टोर पिकअप',
    stepEnRoute: 'चरण 2: ग्राहक के पते पर जाएं',
    tripEarning: 'ट्रिप कमाई',
    pickupRack: 'पिकअप रैक #B-04 • शेल्फ 2',
    pickupHub: 'पिकअप डार्क स्टोर',
    customerDrop: 'ग्राहक का पता',
    itemsChecklist: 'सामान चेकलिस्ट',
    verifyAll: 'सभी सत्यापित करें',
    arrivedAtDarkStore: 'डार्क स्टोर पहुंचे',
    confirmPickupStart: 'पिकअप की पुष्टि करें और ट्रिप शुरू करें',
    arrivedDoorstepVerifyOtp: 'ग्राहक के द्वार पहुंचे और OTP सत्यापित करें',
    collectCash: 'नकद प्राप्त करें',
    prepaidOrder: 'प्रीपेड ऑर्डर',

    tripHistoryTitle: 'ट्रिप इतिहास',
    completedDeliveries: 'पूर्ण की गई डिलीवरी',
    totalEarned: 'कुल कमाई',
    tripsDelivered: 'कुल डिलीवरी',
    avgPerOrder: 'औसत प्रति ऑर्डर',
    all: 'सभी',
    today: 'आज',
    week: 'इस हफ्ते',
    month: 'इस महीने',
    noTripsYet: 'अभी तक कोई ट्रिप दर्ज नहीं हुई है',
    completedStatus: 'पूर्ण हुआ ✓',

    availableBalance: 'उपलब्ध वॉलेट शेष',
    instantImps: 'तत्काल IMPS बैंक ट्रांसफर 24x7',
    floatingCodCash: 'हाथ में नकद संग्रह (COD)',
    instantCashout: 'बैंक में निकालें',
    depositCashBtn: 'नकद जमा करें',
    thisWeek: 'इस हफ्ते',
    thisMonth: 'इस महीने',
    tipsEarned: 'प्राप्त टिप',
    weeklyIncomeTrend: 'साप्ताहिक कमाई ग्राफ',
    incomeLedger: 'कमाई एवं सेटलमेंट लेजर',

    lifetimeTrips: 'कुल जीवनकाल ट्रिप्स',
    onTimeRate: 'समय पर डिलीवरी',
    partnerTier: 'गोल्ड प्रो पार्टनर',
    fleetVerification: 'वाहन एवं सत्यापन',
    registeredVehicle: 'पंजीकृत डिलीवरी वाहन',
    kycLicense: 'केवाईसी और ड्राइविंग लाइसेंस',
    medicalInsurance: 'स्वास्थ्य एवं दुर्घटना बीमा',
    preferencesApp: 'ऐप प्राथमिकताएं',
    allSettings: 'सभी सेटिंग्स और प्राथमिकताएं',
    orderSiren: 'ऑर्डर अलर्ट सायरन',
    autoNav: 'ऑटो गूगल मैप्स नेविगेशन',
    appLanguage: 'ऐप की भाषा',
    safetyAccount: 'सुरक्षा एवं खाता',
    safetySOS: 'सुरक्षा केंद्र एवं 24/7 आपातकालीन SOS',
    logout: 'लॉग आउट',
    confirmLogoutTitle: 'लॉग आउट की पुष्टि करें',
    confirmLogoutDesc: 'क्या आप निश्चित रूप से ऑफ़लाइन जाना और अपने डिलीवरी पार्टनर खाते से लॉग आउट करना चाहते हैं?',

    chatWith: 'ग्राहक से चैट करें',
    quickReplies: '1-टैप त्वरित जवाब',
    typeMessage: 'संदेश टाइप करें...',
    depositCodCashTitle: 'नकद संग्रह जमा करें',
    upiApps: 'तत्काल UPI ऐप्स (GPay, PhonePe)',
    storeQrCode: 'स्टोर QR कोड',
    cashVault: 'डार्क स्टोर कैश काउंटर जमा',
    payAndClear: 'भुगतान करें और बकाया चुकाएं',
    verifyDoorstepOtp: 'ग्राहक OTP दर्ज करें',
    autoFill: 'ऑटो-फिल',
  },
  KN: {
    home: 'ಹೋಮ್',
    activeDelivery: 'ಲೈವ್ ಡೆಲಿವರಿ',
    trips: 'ಟ್ರಿಪ್‌ಗಳು',
    earnings: 'ಸಂಪಾದನೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    officialId: 'ಅಧಿಕೃತ ಡೆಲಿವರಿ ಪಾರ್ಟ್ನರ್ ಐಡಿ',
    activeVerified: 'ಸಕ್ರಿಯ ಮತ್ತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    onDuty: 'ಆನ್ ಡ್ಯೂಟಿ',
    goOnline: 'ಆನ್‌ಲೈನ್‌ಗೆ ಹೋಗಿ',
    koramangalaHub: 'ಕೊರಮಂಗಲ ಡಾರ್ಕ್ ಸ್ಟೋರ್ #04',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    active: 'ಸಕ್ರಿಯ',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',

    activeOrderHeading: 'ಸಕ್ರಿಯ ಡೆಲಿವರಿ',
    enRouteCustomer: 'ಗ್ರಾಹಕರ ವಿಳಾಸಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿದೆ',
    atDarkStore: 'ಡಾರ್ಕ್ ಸ್ಟೋರ್ ಪಿಕ್ ಅಪ್',
    trackOrder: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ➔',
    waitingOrders: 'ಹೊಸ ಆರ್ಡರ್‌ಗಳಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...',
    priorityRadarActive: '⚡ ಪ್ರಮುಖ ರೇಡಾರ್ ಸಕ್ರಿಯ',
    tripsDone: 'ಒಟ್ಟು ಪ್ರವಾಸಗಳು',
    shiftTime: 'ಶಿಫ್ಟ್ ಸಮಯ',
    codCash: 'ನಗದು ಸಂಗ್ರಹ',
    dailyQuest: 'ದೈನಂದಿನ ಗುರಿ (14/20)',
    questBonus: '+₹250 ಬೋನಸ್',
    deposit: 'ಜಮೆ ಮಾಡಿ',
    sos: 'ಸುರಕ್ಷತೆ SOS',
    wallet: 'ವಾಲೆಟ್',
    testOrder: '+ ಪರೀಕ್ಷೆ',

    stepGoStore: 'ಹಂತ 1: ಡಾರ್ಕ್ ಸ್ಟೋರ್‌ಗೆ ಹೋಗಿ',
    stepAtStore: 'ಹಂತ 1: ಡಾರ್ಕ್ ಸ್ಟೋರ್ ಪಿಕ್‌ಅಪ್',
    stepEnRoute: 'ಹಂತ 2: ಗ್ರಾಹಕರ ವಿಳಾಸಕ್ಕೆ ಹೋಗಿ',
    tripEarning: 'ಪ್ರವಾಸದ ಆದಾಯ',
    pickupRack: 'ಪಿಕ್‌ಅಪ್ ರ್ಯಾಕ್ #B-04',
    pickupHub: 'ಪಿಕ್‌ಅಪ್ ಸ್ಟೋರ್',
    customerDrop: 'ಗ್ರಾಹಕರ ವಿಳಾಸ',
    itemsChecklist: 'ಪಟ್ಟಿ ಪರಿಶೀಲನೆ',
    verifyAll: 'ಎಲ್ಲವನ್ನೂ ಪರಿಶೀಲಿಸಿ',
    arrivedAtDarkStore: 'ಡಾರ್ಕ್ ಸ್ಟೋರ್ ತಲುಪಿದೆ',
    confirmPickupStart: 'ಪಿಕ್‌ಅಪ್ ದೃಢೀಕರಿಸಿ ಮತ್ತು ಟ್ರಿಪ್ ಪ್ರಾರಂಭಿಸಿ',
    arrivedDoorstepVerifyOtp: 'ಗ್ರಾಹಕರ ಮನೆ ತಲುಪಿದೆ - OTP ನಮೂದಿಸಿ',
    collectCash: 'ನಗದು ಪಡೆಯಿರಿ',
    prepaidOrder: 'ಪೂರ್ವ ಪಾವತಿಸಿದ ಆರ್ಡರ್',

    tripHistoryTitle: 'ಪ್ರವಾಸದ ಇತಿಹಾಸ',
    completedDeliveries: 'ಪೂರ್ಣಗೊಂಡ ಡೆಲಿವರಿಗಳು',
    totalEarned: 'ಒಟ್ಟು ಸಂಪಾದನೆ',
    tripsDelivered: 'ಒಟ್ಟು ಡೆಲಿವರಿಗಳು',
    avgPerOrder: 'ಸರಾಸರಿ ಪ್ರತಿ ಆರ್ಡರ್',
    all: 'ಎಲ್ಲಾ',
    today: 'ಇಂದು',
    week: 'ಈ ವಾರ',
    month: 'ಈ ತಿಂಗಳು',
    noTripsYet: 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರವಾಸಗಳು ದಾಖಲಾಗಿಲ್ಲ',
    completedStatus: 'ಪೂರ್ಣಗೊಂಡಿದೆ ✓',

    availableBalance: 'ಲಭ್ಯವಿರುವ ವಾಲೆಟ್ ಹಣ',
    instantImps: 'ತಕ್ಷಣದ ಬ್ಯಾಂಕ್ ಟ್ರಾನ್ಸ್‌ಫರ್ 24x7',
    floatingCodCash: 'ಕೈಯಲ್ಲಿರುವ ನಗದು (COD)',
    instantCashout: 'ಬ್ಯಾಂಕ್‌ಗೆ ಪಡೆಯಿರಿ',
    depositCashBtn: 'ನಗದು ಜಮೆ ಮಾಡಿ',
    thisWeek: 'ಈ ವಾರ',
    thisMonth: 'ಈ ತಿಂಗಳು',
    tipsEarned: 'ಪಡೆದ ಟಿಪ್ಸ್',
    weeklyIncomeTrend: 'ವಾರದ ಆದಾಯ ಗ್ರಾಫ್',
    incomeLedger: 'ಆದಾಯ ಮತ್ತು ಲೆಕ್ಕಪತ್ರ',

    lifetimeTrips: 'ಒಟ್ಟು ಪ್ರವಾಸಗಳು',
    onTimeRate: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಡೆಲಿವರಿ',
    partnerTier: 'ಗೋಲ್ಡ್ ಪ್ರೋ ಪಾರ್ಟ್ನರ್',
    fleetVerification: 'ವಾಹನ ಮತ್ತು ಪರಿಶೀಲನೆ',
    registeredVehicle: 'ನೋಂದಾಯಿತ ಡೆಲಿವರಿ ವಾಹನ',
    kycLicense: 'ಕೆವೈಸಿ ಮತ್ತು ಚಾಲನಾ ಪರವಾನಗಿ',
    medicalInsurance: 'ಆರೋಗ್ಯ ಮತ್ತು ಅಪಘಾತ ವಿಮೆ',
    preferencesApp: 'ಆಪ್ ಆದ್ಯತೆಗಳು',
    allSettings: 'ಎಲ್ಲಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳು',
    orderSiren: 'ಆರ್ಡರ್ ಅಲರ್ಟ್ ಸೈರನ್',
    autoNav: 'ಆಟೋ ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ನ್ಯಾವಿಗೇಷನ್',
    appLanguage: 'ಆಪ್ ಭಾಷೆ',
    safetyAccount: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಖಾತೆ',
    safetySOS: 'ಸುರಕ್ಷತಾ ಕೇಂದ್ರ ಮತ್ತು 24/7 ತುರ್ತು SOS',
    logout: 'ಲಾಗ್ ಔಟ್',
    confirmLogoutTitle: 'ಲಾಗ್ ಔಟ್ ದೃಢೀಕರಿಸಿ',
    confirmLogoutDesc: 'ನೀವು ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಖಚಿತವಾಗಿದೆಯೇ?',

    chatWith: 'ಗ್ರಾಹಕರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ',
    quickReplies: '1-ಟ್ಯಾಪ್ ತ್ವರಿತ ಉತ್ತರ',
    typeMessage: 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...',
    depositCodCashTitle: 'ನಗದು ಸಂಗ್ರಹ ಜಮೆ ಮಾಡಿ',
    upiApps: 'UPI ಆಪ್‌ಗಳು (GPay, PhonePe)',
    storeQrCode: 'ಸ್ಟೋರ್ QR ಕೋಡ್',
    cashVault: 'ಡಾರ್ಕ್ ಸ್ಟೋರ್ ನಗದು ಜಮೆ',
    payAndClear: 'ಪಾವತಿಸಿ ಮತ್ತು ಬಾಕಿ ತೀರಿಸಿ',
    verifyDoorstepOtp: 'ಗ್ರಾಹಕರ OTP ನಮೂದಿಸಿ',
    autoFill: 'ಆಟೋ ಫಿಲ್',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: LanguageTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('EN');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguageContext = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return ctx;
};
