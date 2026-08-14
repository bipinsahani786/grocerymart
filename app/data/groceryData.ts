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
}

export interface Offer {
  id: string;
  title: string;
  subTitle: string;
  discount: string;
  gradientColors: string[];
  emoji: string;
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
    title: 'Super Saver Week',
    subTitle: 'On all fresh organic produce',
    discount: 'UP TO 50% OFF',
    gradientColors: ['#10B981', '#059669'],
    emoji: '🍉',
  },
  {
    id: '2',
    title: 'Breakfast Essentials',
    subTitle: 'Start your morning healthy',
    discount: 'FLAT 20% OFF',
    gradientColors: ['#F59E0B', '#D97706'],
    emoji: '🥞',
  },
  {
    id: '3',
    title: 'Weekend Snack Feast',
    subTitle: 'Perfect for movie nights',
    discount: 'BUY 2 GET 1 FREE',
    gradientColors: ['#3B82F6', '#2563EB'],
    emoji: '🍟',
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
