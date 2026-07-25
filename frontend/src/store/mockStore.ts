import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  unit: string;
  basePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAt: number;
  sku: string;
  barcode: string;
  rackLocation: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  productCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: 'POS' | 'Delivery' | 'Click & Collect';
  status: 'PLACED' | 'ACCEPTED' | 'PACKED' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Khata (Credit)';
  paymentStatus: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  taxAmount: number;
  createdAt: string;
  notes?: string;
  distanceKm?: number;
  pin?: string;
}

export interface KhataEntry {
  id: string;
  date: string;
  type: 'credit' | 'payment';
  amount: number;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  khataBalance: number; // positive = customer owes store, negative = advance/prepaid
  khataLedger: KhataEntry[];
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: 'Cashier' | 'Picker' | 'Delivery Rider' | 'Store Manager';
  pin: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Off';
  clockedIn: boolean;
  performance: {
    ordersProcessed: number;
    avgPackTimeMinutes: number;
    rating: number;
  };
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  gpsCoords: string;
  openingTime: string;
  closingTime: string;
  gstNumber: string;
  cgstRate: number;
  sgstRate: number;
  taxInclusive: boolean;
  receiptWidth: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
}

interface MockStoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  staff: Staff[];
  settings: StoreSettings;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number, reason: string) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => void;
  editCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => void;
  refundOrder: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'khataBalance' | 'khataLedger' | 'createdAt' | 'totalSpent'>) => void;
  addKhataEntry: (customerId: string, type: 'credit' | 'payment', amount: number, description: string) => void;
  
  addStaff: (member: Omit<Staff, 'id' | 'clockedIn' | 'performance'>) => void;
  updateStaffShift: (id: string, shift: Staff['shift']) => void;
  toggleClockIn: (id: string) => void;

  updateSettings: (updates: Partial<StoreSettings>) => void;
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Dairy & Eggs', parentId: null, productCount: 2 },
  { id: 'cat-2', name: 'Snacks & Biscuits', parentId: null, productCount: 2 },
  { id: 'cat-3', name: 'Beverages', parentId: null, productCount: 2 },
  { id: 'cat-4', name: 'Staples & Grains', parentId: null, productCount: 2 },
  { id: 'cat-5', name: 'Fruits & Vegetables', parentId: null, productCount: 2 },
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Amul Taaza Milk 500ml',
    brand: 'Amul',
    categoryId: 'cat-1',
    unit: 'piece',
    basePrice: 24,
    sellingPrice: 28,
    stock: 14,
    lowStockAt: 15,
    sku: 'AMUL-MILK-500ML',
    barcode: '8901262151121',
    rackLocation: 'Cold Zone C1',
    isActive: true,
  },
  {
    id: 'prod-2',
    name: 'Mother Dairy Paneer 200g',
    brand: 'Mother Dairy',
    categoryId: 'cat-1',
    unit: 'piece',
    basePrice: 75,
    sellingPrice: 85,
    stock: 8,
    lowStockAt: 10,
    sku: 'MD-PANEER-200G',
    barcode: '8901656002102',
    rackLocation: 'Cold Zone C2',
    isActive: true,
  },
  {
    id: 'prod-3',
    name: 'Kurkure Masala Munch 26g',
    brand: 'Pepsico',
    categoryId: 'cat-2',
    unit: 'piece',
    basePrice: 8,
    sellingPrice: 10,
    stock: 45,
    lowStockAt: 20,
    sku: 'KURKURE-MM-26G',
    barcode: '8901491101831',
    rackLocation: 'Aisle A3-S2',
    isActive: true,
  },
  {
    id: 'prod-4',
    name: 'Oreo Biscuits 120g',
    brand: 'Cadbury',
    categoryId: 'cat-2',
    unit: 'piece',
    basePrice: 26,
    sellingPrice: 30,
    stock: 5,
    lowStockAt: 12,
    sku: 'OREO-120G',
    barcode: '8901058002315',
    rackLocation: 'Aisle A3-S4',
    isActive: true,
  },
  {
    id: 'prod-5',
    name: 'Bisleri Mineral Water 1L',
    brand: 'Bisleri',
    categoryId: 'cat-3',
    unit: 'piece',
    basePrice: 15,
    sellingPrice: 20,
    stock: 60,
    lowStockAt: 15,
    sku: 'BISLERI-1L',
    barcode: '8906001300017',
    rackLocation: 'Aisle B1-S1',
    isActive: true,
  },
  {
    id: 'prod-6',
    name: 'Coca Cola 750ml',
    brand: 'Coca Cola',
    categoryId: 'cat-3',
    unit: 'piece',
    basePrice: 38,
    sellingPrice: 45,
    stock: 22,
    lowStockAt: 10,
    sku: 'COKE-750ML',
    barcode: '5449000118567',
    rackLocation: 'Aisle B1-S3',
    isActive: true,
  },
  {
    id: 'prod-7',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    brand: 'ITC',
    categoryId: 'cat-4',
    unit: 'piece',
    basePrice: 230,
    sellingPrice: 260,
    stock: 18,
    lowStockAt: 5,
    sku: 'AASHIRVAAD-ATTA-5KG',
    barcode: '8901725181226',
    rackLocation: 'Heavy Rack H1',
    isActive: true,
  },
  {
    id: 'prod-8',
    name: 'Fortune Mustard Oil 1L',
    brand: 'Fortune',
    categoryId: 'cat-4',
    unit: 'piece',
    basePrice: 155,
    sellingPrice: 175,
    stock: 2,
    lowStockAt: 8,
    sku: 'FORTUNE-OIL-1L',
    barcode: '8906007281051',
    rackLocation: 'Heavy Rack H2',
    isActive: true,
  },
  {
    id: 'prod-9',
    name: 'Fresh Potato (Aloo) 1kg',
    brand: 'Local Farm',
    categoryId: 'cat-5',
    unit: 'kg',
    basePrice: 22,
    sellingPrice: 30,
    stock: 50,
    lowStockAt: 15,
    sku: 'VEG-POTATO-1KG',
    barcode: 'MOCK-VEG-POTATO',
    rackLocation: 'Produce Bin P1',
    isActive: true,
  },
  {
    id: 'prod-10',
    name: 'Fresh Onion (Pyaz) 1kg',
    brand: 'Local Farm',
    categoryId: 'cat-5',
    unit: 'kg',
    basePrice: 32,
    sellingPrice: 40,
    stock: 35,
    lowStockAt: 15,
    sku: 'VEG-ONION-1KG',
    barcode: 'MOCK-VEG-ONION',
    rackLocation: 'Produce Bin P2',
    isActive: true,
  },
];

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Kumar',
    phone: '9876543210',
    email: 'rahul.k@gmail.com',
    totalSpent: 2400,
    khataBalance: 450,
    khataLedger: [
      { id: 'kh-1', date: '2026-07-08T10:30:00Z', type: 'credit', amount: 650, description: 'Order #POS-1002' },
      { id: 'kh-2', date: '2026-07-09T18:15:00Z', type: 'payment', amount: 200, description: 'Cash received' }
    ],
    createdAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Priya Sharma',
    phone: '9123456789',
    email: 'sharmapriya@yahoo.com',
    totalSpent: 3100,
    khataBalance: 0,
    khataLedger: [],
    createdAt: '2026-06-20T14:30:00Z',
  },
  {
    id: 'cust-3',
    name: 'Amit Singh',
    phone: '8877665544',
    email: 'amit.singh@outlook.com',
    totalSpent: 1500,
    khataBalance: -150, // Prepaid balance
    khataLedger: [
      { id: 'kh-3', date: '2026-07-09T12:00:00Z', type: 'payment', amount: 500, description: 'UPI Advance deposit' },
      { id: 'kh-4', date: '2026-07-10T11:00:00Z', type: 'credit', amount: 350, description: 'Order #POS-1004' }
    ],
    createdAt: '2026-07-01T11:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Sunita Verma',
    phone: '7766554433',
    khataBalance: 1200,
    totalSpent: 5400,
    khataLedger: [
      { id: 'kh-5', date: '2026-07-05T09:00:00Z', type: 'credit', amount: 1200, description: 'Bulk monthly staples khata order' }
    ],
    createdAt: '2026-05-10T08:00:00Z',
  }
];

const defaultStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Raju Kumar',
    phone: '9988776655',
    role: 'Cashier',
    pin: '1234',
    shift: 'Morning',
    clockedIn: true,
    performance: {
      ordersProcessed: 154,
      avgPackTimeMinutes: 2.8,
      rating: 4.8
    }
  },
  {
    id: 'staff-2',
    name: 'Deepika Sen',
    phone: '9888776655',
    role: 'Picker',
    pin: '2345',
    shift: 'Evening',
    clockedIn: false,
    performance: {
      ordersProcessed: 88,
      avgPackTimeMinutes: 4.1,
      rating: 4.5
    }
  },
  {
    id: 'staff-3',
    name: 'Ramesh Prasad',
    phone: '9777665544',
    role: 'Delivery Rider',
    pin: '3456',
    shift: 'Morning',
    clockedIn: true,
    performance: {
      ordersProcessed: 67,
      avgPackTimeMinutes: 12.5,
      rating: 4.9
    }
  }
];

const defaultOrders: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543210',
    type: 'Delivery',
    status: 'DELIVERED',
    items: [
      { productId: 'prod-1', productName: 'Amul Taaza Milk 500ml', qty: 2, price: 28 },
      { productId: 'prod-3', productName: 'Kurkure Masala Munch 26g', qty: 3, price: 10 }
    ],
    totalAmount: 86,
    discount: 0,
    paymentMethod: 'UPI',
    paymentStatus: 'Success',
    taxAmount: 4.1,
    createdAt: '2026-07-10T09:15:00Z',
    distanceKm: 2.3,
  },
  {
    id: 'ORD-1002',
    customerName: 'Priya Sharma',
    customerPhone: '9123456789',
    type: 'Click & Collect',
    status: 'READY',
    items: [
      { productId: 'prod-7', productName: 'Aashirvaad Shudh Chakki Atta 5kg', qty: 1, price: 260 },
      { productId: 'prod-5', productName: 'Bisleri Mineral Water 1L', qty: 5, price: 20 },
      { productId: 'prod-2', productName: 'Mother Dairy Paneer 200g', qty: 2, price: 85 }
    ],
    totalAmount: 530,
    discount: 50,
    paymentMethod: 'Card',
    paymentStatus: 'Success',
    taxAmount: 22.5,
    createdAt: '2026-07-10T10:45:00Z',
    pin: '1904',
  },
  {
    id: 'ORD-1003',
    customerName: 'Walk-In Customer',
    customerPhone: '9999999999',
    type: 'POS',
    status: 'DELIVERED',
    items: [
      { productId: 'prod-6', productName: 'Coca Cola 750ml', qty: 2, price: 45 },
      { productId: 'prod-3', productName: 'Kurkure Masala Munch 26g', qty: 5, price: 10 }
    ],
    totalAmount: 140,
    discount: 10,
    paymentMethod: 'Cash',
    paymentStatus: 'Success',
    taxAmount: 6.7,
    createdAt: '2026-07-10T11:20:00Z',
  },
  {
    id: 'ORD-1004',
    customerName: 'Amit Singh',
    customerPhone: '8877665544',
    type: 'POS',
    status: 'PLACED',
    items: [
      { productId: 'prod-8', productName: 'Fortune Mustard Oil 1L', qty: 2, price: 175 }
    ],
    totalAmount: 350,
    discount: 0,
    paymentMethod: 'Khata (Credit)',
    paymentStatus: 'Pending',
    taxAmount: 16.7,
    createdAt: '2026-07-10T12:10:00Z',
  },
  {
    id: 'ORD-1005',
    customerName: 'Karan Malhotra',
    customerPhone: '9812345670',
    type: 'Delivery',
    status: 'ACCEPTED',
    items: [
      { productId: 'prod-9', productName: 'Fresh Potato (Aloo) 1kg', qty: 3, price: 30 },
      { productId: 'prod-10', productName: 'Fresh Onion (Pyaz) 1kg', qty: 2, price: 40 },
      { productId: 'prod-5', productName: 'Bisleri Mineral Water 1L', qty: 2, price: 20 }
    ],
    totalAmount: 210,
    discount: 15,
    paymentMethod: 'UPI',
    paymentStatus: 'Success',
    taxAmount: 10,
    createdAt: '2026-07-10T12:35:00Z',
    distanceKm: 4.1,
  }
];

const defaultSettings: StoreSettings = {
  name: 'Grocery Mart - Sector 62',
  address: 'Shop No. 12-14, Block C, Sector 62, Noida, UP 201301',
  phone: '+91 120 4567890',
  gpsCoords: '28.6273, 77.3725',
  openingTime: '07:00',
  closingTime: '23:00',
  gstNumber: '09AAECG8213R1Z7',
  cgstRate: 2.5,
  sgstRate: 2.5,
  taxInclusive: true,
  receiptWidth: '80mm',
  autoPrintReceipt: true,
  deliveryEnabled: true,
  pickupEnabled: true,
};

export const useMockStore = create<MockStoreState>()(
  persist(
    (set) => ({
      products: defaultProducts,
      categories: defaultCategories,
      orders: defaultOrders,
      customers: defaultCustomers,
      staff: defaultStaff,
      settings: defaultSettings,

      // Product Operations
      addProduct: (prod) => set((state) => {
        const id = 'prod-' + (state.products.length + 1);
        const newProduct = { ...prod, id };
        // Increment category productCount
        const categories = state.categories.map(c => 
          c.id === prod.categoryId ? { ...c, productCount: c.productCount + 1 } : c
        );
        return {
          products: [...state.products, newProduct],
          categories
        };
      }),

      editProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProduct: (id) => set((state) => {
        const target = state.products.find(p => p.id === id);
        if (!target) return {};
        // Decrement category productCount
        const categories = state.categories.map(c => 
          c.id === target.categoryId ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c
        );
        return {
          products: state.products.filter(p => p.id !== id),
          categories
        };
      }),

      adjustStock: (id, delta) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
      })),

      // Category Operations
      addCategory: (cat) => set((state) => {
        const id = 'cat-' + (state.categories.length + 1);
        const newCategory: Category = { ...cat, id, productCount: 0 };
        return { categories: [...state.categories, newCategory] };
      }),

      editCategory: (id, name) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name } : c)
      })),

      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      // Order Operations
      addOrder: (order) => set((state) => {
        const orderId = 'ORD-' + (1000 + state.orders.length + 1);
        const newOrder: Order = {
          ...order,
          id: orderId,
          createdAt: new Date().toISOString()
        };

        // If registered customer, increase totalSpent and Khata if applicable
        const customers = state.customers.map(c => {
          if (c.phone === order.customerPhone || c.name === order.customerName) {
            let khataBalance = c.khataBalance;
            const ledger = [...c.khataLedger];
            
            if (order.paymentMethod === 'Khata (Credit)') {
              khataBalance += order.totalAmount;
              ledger.push({
                id: 'kh-' + (ledger.length + 1),
                date: new Date().toISOString(),
                type: 'credit',
                amount: order.totalAmount,
                description: `Order #${orderId}`
              });
            }

            return {
              ...c,
              totalSpent: c.totalSpent + order.totalAmount,
              khataBalance,
              khataLedger: ledger
            };
          }
          return c;
        });

        // Deduct inventory stock
        const products = state.products.map(p => {
          const item = order.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, stock: Math.max(0, p.stock - item.qty) };
          }
          return p;
        });

        return {
          orders: [newOrder, ...state.orders],
          customers,
          products
        };
      }),

      updateOrderStatus: (id, status, paymentStatus) => set((state) => {
        const orders = state.orders.map(o => {
          if (o.id === id) {
            const updates: Partial<Order> = { status };
            if (paymentStatus) {
              updates.paymentStatus = paymentStatus;
            } else if (status === 'DELIVERED') {
              updates.paymentStatus = 'Success';
            }
            return { ...o, ...updates };
          }
          return o;
        });

        // Update picker/delivery performance stats if completed
        let staff = [...state.staff];
        if (status === 'PACKED' || status === 'DELIVERED') {
          const order = state.orders.find(o => o.id === id);
          if (order) {
            staff = state.staff.map(s => {
              if (s.role === 'Picker' && status === 'PACKED') {
                return {
                  ...s,
                  performance: {
                    ...s.performance,
                    ordersProcessed: s.performance.ordersProcessed + 1
                  }
                };
              }
              if (s.role === 'Delivery Rider' && status === 'DELIVERED' && order.type === 'Delivery') {
                return {
                  ...s,
                  performance: {
                    ...s.performance,
                    ordersProcessed: s.performance.ordersProcessed + 1
                  }
                };
              }
              return s;
            });
          }
        }

        return { orders, staff };
      }),

      refundOrder: (id) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!order) return {};

        const orders = state.orders.map(o => o.id === id ? {
          ...o,
          status: 'REFUNDED' as const,
          paymentStatus: 'Refunded' as const
        } : o);

        // Adjust stock back (add items back to stock)
        const products = state.products.map(p => {
          const item = order.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, stock: p.stock + item.qty };
          }
          return p;
        });

        // Adjust customer khata / spent if registered customer
        const customers = state.customers.map(c => {
          if (c.phone === order.customerPhone) {
            let khataBalance = c.khataBalance;
            const ledger = [...c.khataLedger];
            if (order.paymentMethod === 'Khata (Credit)') {
              khataBalance = Math.max(0, khataBalance - order.totalAmount);
              ledger.push({
                id: 'kh-' + (ledger.length + 1),
                date: new Date().toISOString(),
                type: 'payment',
                amount: order.totalAmount,
                description: `Refund for Order #${id}`
              });
            }
            return {
              ...c,
              totalSpent: Math.max(0, c.totalSpent - order.totalAmount),
              khataBalance,
              khataLedger: ledger
            };
          }
          return c;
        });

        return { orders, products, customers };
      }),

      // Customer / Khata Operations
      addCustomer: (cust) => set((state) => {
        const id = 'cust-' + (state.customers.length + 1);
        const newCustomer: Customer = {
          ...cust,
          id,
          totalSpent: 0,
          khataBalance: 0,
          khataLedger: [],
          createdAt: new Date().toISOString()
        };
        return { customers: [...state.customers, newCustomer] };
      }),

      addKhataEntry: (customerId, type, amount, description) => set((state) => ({
        customers: state.customers.map(c => {
          if (c.id === customerId) {
            const entry: KhataEntry = {
              id: 'kh-' + (c.khataLedger.length + 1),
              date: new Date().toISOString(),
              type,
              amount,
              description
            };
            const khataBalance = type === 'credit' 
              ? c.khataBalance + amount 
              : c.khataBalance - amount;

            return {
              ...c,
              khataBalance,
              khataLedger: [...c.khataLedger, entry]
            };
          }
          return c;
        })
      })),

      // Staff Operations
      addStaff: (member) => set((state) => {
        const id = 'staff-' + (state.staff.length + 1);
        const newMember: Staff = {
          ...member,
          id,
          clockedIn: false,
          performance: {
            ordersProcessed: 0,
            avgPackTimeMinutes: 0,
            rating: 5.0
          }
        };
        return { staff: [...state.staff, newMember] };
      }),

      updateStaffShift: (id, shift) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, shift } : s)
      })),

      toggleClockIn: (id) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, clockedIn: !s.clockedIn } : s)
      })),

      // Settings
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
    }),
    {
      name: 'grocerymart-store-mock-db',
    }
  )
);
