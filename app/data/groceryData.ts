export interface Category {
  id: string;
  dbId?: string;
  name: string;
  emoji?: string;
  slug?: string;
  image?: string | null;
  imageUrl?: string | null;
  itemCount?: number;
}

export interface ProductVariantData {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  imageUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  category: string;
  categoryName?: string;
  categoryId?: string;
  price: number;
  mrp?: number | null;
  originalPrice?: number | null;
  unit?: string;
  weight: string;
  sku?: string | null;
  barcode?: string | null;
  hsnCode?: string | null;
  productType?: string;
  emoji?: string;
  image?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  rating: number;
  outOfStock?: boolean;
  stock?: number;
  storeName?: string;
  storeId?: string;
  availableForDelivery?: boolean;
  availableForClickCollect?: boolean;
  variants?: ProductVariantData[];
}

export interface Offer {
  id: string;
  title: string;
  subTitle: string;
  discount: string;
  gradientColors: string[];
  emoji?: string;
  imageUrl?: string;
}

export const offers: Offer[] = [
  {
    id: '1',
    title: 'Fresh Veggies & Fruits',
    subTitle: 'Directly from organic local farms',
    discount: 'UP TO 40% OFF',
    gradientColors: ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.75)', 'rgba(4, 120, 87, 0.2)'],
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Pantry & Cooking Essentials',
    subTitle: 'Premium refined oils, ghee & spices',
    discount: 'FLAT 15% OFF',
    gradientColors: ['rgba(217, 119, 6, 0.95)', 'rgba(180, 83, 9, 0.75)', 'rgba(146, 64, 14, 0.2)'],
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Daily Care & Hygiene',
    subTitle: 'Premium soaps, shampoos & detergents',
    discount: 'BUY 2 GET 1 FREE',
    gradientColors: ['rgba(6, 182, 212, 0.95)', 'rgba(8, 145, 178, 0.75)', 'rgba(21, 94, 117, 0.2)'],
    imageUrl: 'https://images.unsplash.com/photo-1607006342411-92fc2a4d33a5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    title: 'Fresh Dairy & Breakfast',
    subTitle: 'Organic milk, butter, farm eggs & bread',
    discount: 'UP TO 30% OFF',
    gradientColors: ['rgba(236, 72, 153, 0.95)', 'rgba(219, 39, 119, 0.75)', 'rgba(157, 23, 77, 0.2)'],
    imageUrl: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '5',
    title: 'Snacks & Beverages',
    subTitle: 'Chocolates, chips, soft drinks & juices',
    discount: 'MINIMUM 25% OFF',
    gradientColors: ['rgba(99, 102, 241, 0.95)', 'rgba(79, 70, 229, 0.75)', 'rgba(55, 48, 163, 0.2)'],
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=800',
  },
];
