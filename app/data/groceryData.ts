export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  weight: string;
  emoji: string;
  rating: number;
  description: string;
  outOfStock?: boolean;
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

export const categories: Category[] = [
  { id: 'all', name: 'All Items', emoji: '🛒' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'vegetables', name: 'Veggies', emoji: '🥦' },
  { id: 'dairy', name: 'Dairy & Eggs', emoji: '🥛' },
  { id: 'bakery', name: 'Bakery', emoji: '🍞' },
  { id: 'beverages', name: 'Beverages', emoji: '🥤' },
  { id: 'snacks', name: 'Snacks', emoji: '🍿' },
];

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

export const products: Product[] = [
  // Fruits
  {
    id: 'f1',
    name: 'Organic Red Apples',
    category: 'fruits',
    price: 120,
    weight: '1 kg',
    emoji: '🍎',
    rating: 4.8,
    description: 'Crisp, sweet, and locally sourced organic red apples.',
  },
  {
    id: 'f2',
    name: 'Fresh Cavendish Bananas',
    category: 'fruits',
    price: 45,
    weight: '1 bunch (5-6 pcs)',
    emoji: '🍌',
    rating: 4.7,
    description: 'Rich in potassium and perfect for snacking.',
  },
  {
    id: 'f3',
    name: 'Sweet Strawberries',
    category: 'fruits',
    price: 140,
    weight: '250g pack',
    emoji: '🍓',
    rating: 4.9,
    description: 'Juicy, vibrant red strawberries freshly harvested.',
  },

  // Vegetables
  {
    id: 'v1',
    name: 'Fresh Broccoli Crown',
    category: 'vegetables',
    price: 60,
    weight: '500g',
    emoji: '🥦',
    rating: 4.6,
    description: 'Fresh green broccoli crowns packed with vitamins.',
  },
  {
    id: 'v2',
    name: 'Organic Roma Tomatoes',
    category: 'vegetables',
    price: 35,
    weight: '1 kg',
    emoji: '🍅',
    rating: 4.5,
    description: 'Plump and juicy tomatoes, ideal for curries and salads.',
  },
  {
    id: 'v3',
    name: 'Baby Spinach Leaves',
    category: 'vegetables',
    price: 25,
    weight: '200g bunch',
    emoji: '🥬',
    rating: 4.8,
    description: 'Tender baby spinach leaves, pre-washed and ready to cook.',
  },

  // Dairy & Eggs
  {
    id: 'd1',
    name: 'Farm Fresh Whole Milk',
    category: 'dairy',
    price: 65,
    weight: '1 Liter',
    emoji: '🥛',
    rating: 4.9,
    description: 'Pure, pasteurized whole milk from local dairy farms.',
  },
  {
    id: 'd2',
    name: 'Free-Range Brown Eggs',
    category: 'dairy',
    price: 85,
    weight: '6-pack',
    emoji: '🥚',
    rating: 4.7,
    description: 'Farm-fresh brown eggs from pasture-raised hens.',
  },
  {
    id: 'd3',
    name: 'Greek Style Plain Yogurt',
    category: 'dairy',
    price: 70,
    weight: '400g tub',
    emoji: '🥣',
    rating: 4.8,
    description: 'Thick, creamy Greek-style yogurt rich in protein.',
  },

  // Bakery
  {
    id: 'b1',
    name: 'Sourdough Artisan Loaf',
    category: 'bakery',
    price: 80,
    weight: '450g loaf',
    emoji: '🍞',
    rating: 4.9,
    description: 'Slow-fermented sourdough with a crispy crust and soft crumb.',
  },
  {
    id: 'b2',
    name: 'Whole Wheat Bread',
    category: 'bakery',
    price: 45,
    weight: '400g loaf',
    emoji: '🥪',
    rating: 4.6,
    description: '100% whole grain wheat bread packed with fiber.',
  },
  {
    id: 'b3',
    name: 'Butter Croissants',
    category: 'bakery',
    price: 90,
    weight: 'Pack of 2',
    emoji: '🥐',
    rating: 4.8,
    description: 'Flaky, buttery French-style croissants baked fresh daily.',
  },

  // Beverages
  {
    id: 'bev1',
    name: 'Freshly Squeezed Orange Juice',
    category: 'beverages',
    price: 95,
    weight: '1 Liter bottle',
    emoji: '🍊',
    rating: 4.9,
    description: '100% pure orange juice with no added sugar or preservatives.',
  },
  {
    id: 'bev2',
    name: 'Sparkling Lemonade',
    category: 'beverages',
    price: 40,
    weight: '330ml can',
    emoji: '🍋',
    rating: 4.5,
    description: 'Refreshing sparkling water with natural lemon zest.',
  },
  {
    id: 'bev3',
    name: 'Cold Brew Coffee',
    category: 'beverages',
    price: 110,
    weight: '250ml bottle',
    emoji: '☕',
    rating: 4.8,
    description: 'Smooth, bold cold-brewed arabica coffee.',
  },

  // Snacks
  {
    id: 's1',
    name: 'Roasted Salted Almonds',
    category: 'snacks',
    price: 180,
    weight: '200g pack',
    emoji: '🥜',
    rating: 4.9,
    description: 'Crunchy California almonds lightly tossed in sea salt.',
  },
  {
    id: 's2',
    name: 'Organic Tortilla Chips',
    category: 'snacks',
    price: 65,
    weight: '150g bag',
    emoji: '🌽',
    rating: 4.6,
    description: 'Crispy stone-ground yellow corn tortilla chips.',
  },
  {
    id: 's3',
    name: 'Dark Chocolate (70% Cocoa)',
    category: 'snacks',
    price: 120,
    weight: '100g bar',
    emoji: '🍫',
    rating: 4.8,
    description: 'Rich and velvety dark chocolate made with organic cacao.',
  },
];
