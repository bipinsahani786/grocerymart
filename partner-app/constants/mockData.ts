export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  vehicleType: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE';
  vehicleNumber: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  onTimeRate: number;
  tier: 'Silver' | 'Gold' | 'Platinum Pro';
  joinedDate: string;
  currentHub: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  scanned: boolean;
  price: number;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  storeAddress: string;
  storeDistanceKm: number;
  storeEstimatedMins: number;
  storePhone: string;
  customerName: string;
  customerAddress: string;
  customerDistanceKm: number;
  customerEstimatedMins: number;
  customerPhone: string;
  deliveryNotes?: string;
  itemsCount: number;
  items: OrderItem[];
  totalAmount: number;
  paymentMode: 'PREPAID' | 'CASH_ON_DELIVERY';
  payoutEarnings: number;
  surgeBonus: number;
  tipAmount: number;
  totalPayout: number;
  status: 'PENDING' | 'ACCEPTED' | 'AT_STORE' | 'PICKED_UP' | 'EN_ROUTE' | 'AT_CUSTOMER' | 'DELIVERED' | 'CANCELLED';
  otp: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface EarningSummary {
  todayTotal: number;
  tripsCount: number;
  onlineHours: number;
  basePay: number;
  surgeBonus: number;
  tips: number;
  incentives: number;
  cashCollected: number;
  floatingCashLimit: number;
  walletBalance: number;
  pendingWithdrawal: number;
}

export const MOCK_RIDER: RiderProfile = {
  id: 'PRT-88492',
  name: 'Rajesh Kumar Verma',
  phone: '+91 98765 43210',
  email: 'rajesh.partner@grocerymart.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  vehicleType: 'EV_BIKE',
  vehicleNumber: 'KA 01 EK 9281',
  rating: 4.94,
  totalTrips: 1482,
  acceptanceRate: 98.6,
  onTimeRate: 99.1,
  tier: 'Platinum Pro',
  joinedDate: 'March 2024',
  currentHub: 'Koramangala Express Hub #04',
};

export const MOCK_SHIFT_SUMMARY: EarningSummary = {
  todayTotal: 1240,
  tripsCount: 14,
  onlineHours: 5.5,
  basePay: 840,
  surgeBonus: 220,
  tips: 80,
  incentives: 100,
  cashCollected: 450,
  floatingCashLimit: 2500,
  walletBalance: 4890,
  pendingWithdrawal: 0,
};

export const MOCK_INCOMING_ORDER: DeliveryOrder = {
  id: 'ord_mock_live_01',
  orderNumber: 'GM-90214',
  storeName: 'GroceryMart DarkStore #04',
  storeAddress: '14th Main Rd, 4th Block, Koramangala, Bengaluru',
  storeDistanceKm: 0.8,
  storeEstimatedMins: 3,
  storePhone: '+91 80 4912 8801',
  customerName: 'Ananya Sharma',
  customerAddress: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur',
  customerDistanceKm: 2.4,
  customerEstimatedMins: 9,
  customerPhone: '+91 99887 76655',
  deliveryNotes: 'Please ring bell twice and leave near doorstep shoe rack.',
  itemsCount: 5,
  items: [
    { id: 'item_1', name: 'Fresh Farm Organic Cow Milk (1L)', quantity: 2, unit: '1L Pouch', category: 'Dairy', scanned: false, price: 68 },
    { id: 'item_2', name: 'Alphonso Mangoes Premium (Pack of 4)', quantity: 1, unit: '1 Box', category: 'Fruits', scanned: false, price: 349 },
    { id: 'item_3', name: 'Whole Wheat Brown Bread', quantity: 1, unit: '400g', category: 'Bakery', scanned: false, price: 55 },
    { id: 'item_4', name: 'Amul Salted Butter', quantity: 1, unit: '500g', category: 'Dairy', scanned: false, price: 275 },
    { id: 'item_5', name: 'Broccoli Fresh Hydroponic', quantity: 1, unit: '250g', category: 'Vegetables', scanned: false, price: 89 },
  ],
  totalAmount: 836,
  paymentMode: 'PREPAID',
  payoutEarnings: 75,
  surgeBonus: 25,
  tipAmount: 30,
  totalPayout: 130,
  status: 'PENDING',
  otp: '4829',
  createdAt: 'Just now',
};

export const MOCK_PAST_TRIPS: DeliveryOrder[] = [
  {
    id: 'ord_hist_01',
    orderNumber: 'GM-89801',
    storeName: 'GroceryMart DarkStore #04',
    storeAddress: '14th Main Rd, Koramangala',
    storeDistanceKm: 0.6,
    storeEstimatedMins: 2,
    storePhone: '+91 80 4912 8801',
    customerName: 'Vikram Mehta',
    customerAddress: 'Villa 12, Sobha Iris, Outer Ring Road',
    customerDistanceKm: 3.1,
    customerEstimatedMins: 11,
    customerPhone: '+91 91234 56780',
    itemsCount: 4,
    items: [],
    totalAmount: 620,
    paymentMode: 'PREPAID',
    payoutEarnings: 65,
    surgeBonus: 20,
    tipAmount: 20,
    totalPayout: 105,
    status: 'DELIVERED',
    otp: '9182',
    createdAt: '11:45 AM',
    deliveredAt: '12:04 PM (19 mins)',
  },
  {
    id: 'ord_hist_02',
    orderNumber: 'GM-89754',
    storeName: 'GroceryMart DarkStore #04',
    storeAddress: '14th Main Rd, Koramangala',
    storeDistanceKm: 1.1,
    storeEstimatedMins: 4,
    storePhone: '+91 80 4912 8801',
    customerName: 'Priya Sundaram',
    customerAddress: 'Flat B-203, Prestige St. Johns Woods',
    customerDistanceKm: 1.8,
    customerEstimatedMins: 7,
    customerPhone: '+91 98841 22334',
    itemsCount: 7,
    items: [],
    totalAmount: 1150,
    paymentMode: 'CASH_ON_DELIVERY',
    payoutEarnings: 80,
    surgeBonus: 30,
    tipAmount: 0,
    totalPayout: 110,
    status: 'DELIVERED',
    otp: '3341',
    createdAt: '10:50 AM',
    deliveredAt: '11:12 AM (22 mins)',
  },
  {
    id: 'ord_hist_03',
    orderNumber: 'GM-89688',
    storeName: 'GroceryMart DarkStore #04',
    storeAddress: '14th Main Rd, Koramangala',
    storeDistanceKm: 0.9,
    storeEstimatedMins: 3,
    storePhone: '+91 80 4912 8801',
    customerName: 'Sanjay Deshmukh',
    customerAddress: 'Tower 4, Salarpuria Sattva Magnificence',
    customerDistanceKm: 2.2,
    customerEstimatedMins: 8,
    customerPhone: '+91 97722 11445',
    itemsCount: 3,
    items: [],
    totalAmount: 430,
    paymentMode: 'PREPAID',
    payoutEarnings: 55,
    surgeBonus: 15,
    tipAmount: 25,
    totalPayout: 95,
    status: 'DELIVERED',
    otp: '5561',
    createdAt: '09:30 AM',
    deliveredAt: '09:48 AM (18 mins)',
  },
];

export const MOCK_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 1450, trips: 16 },
  { day: 'Tue', amount: 1680, trips: 18 },
  { day: 'Wed', amount: 1320, trips: 14 },
  { day: 'Thu', amount: 1890, trips: 20 },
  { day: 'Fri', amount: 2150, trips: 22 },
  { day: 'Sat', amount: 2450, trips: 26 },
  { day: 'Sun (Today)', amount: 1240, trips: 14 },
];

export const MOCK_INCENTIVES = [
  {
    id: 'inc_01',
    title: 'Peak Lunch Rush Rush',
    description: 'Complete 6 orders between 12 PM - 3 PM',
    progress: 4,
    target: 6,
    rewardAmount: 180,
    expiresIn: '1h 15m',
    isUnlocked: false,
  },
  {
    id: 'inc_02',
    title: 'Daily Super Rider Target',
    description: 'Complete 18 orders today before 11:59 PM',
    progress: 14,
    target: 18,
    rewardAmount: 350,
    expiresIn: '6h 30m',
    isUnlocked: false,
  },
  {
    id: 'inc_03',
    title: 'Weekend Warrior Bonus',
    description: 'Earn ₹4,000 across Sat & Sun',
    progress: 3690,
    target: 4000,
    rewardAmount: 600,
    expiresIn: 'Today',
    isUnlocked: false,
  },
];

export const MOCK_KYC_DOCS = [
  { id: 'doc_1', title: 'Driving License (DL)', status: 'VERIFIED', expiry: 'Exp: 14 Dec 2031' },
  { id: 'doc_2', title: 'Vehicle Registration (RC)', status: 'VERIFIED', expiry: 'KA 01 EK 9281' },
  { id: 'doc_3', title: 'Commercial Insurance', status: 'VERIFIED', expiry: 'Exp: 22 Oct 2026' },
  { id: 'doc_4', title: 'Aadhaar Card Verification', status: 'VERIFIED', expiry: 'Verified via DigiLocker' },
  { id: 'doc_5', title: 'Bank Account & IFSC', status: 'VERIFIED', expiry: 'HDFC Bank ****4921' },
];
