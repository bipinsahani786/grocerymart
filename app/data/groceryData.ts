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
    price: 3.99,
    weight: '1 kg',
    emoji: '🍎',
    rating: 4.8,
    description: 'Crisp, sweet, and locally sourced organic red apples.',
  },
  {
    id: 'f2',
    name: 'Fresh Cavendish Bananas',
    category: 'fruits',
    price: 1.89,
    weight: '1 bunch (approx 5-6 pcs)',
    emoji: '🍌',
    rating: 4.7,
    description: 'Rich in potassium and perfect for snacking.',
  },
  {
    id: 'f3',
    name: 'Sweet Strawberries',
    category: 'fruits',
    price: 4.49,
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
    price: 2.29,
    weight: '500g',
    emoji: '🥦',
    rating: 4.6,
    description: 'Fresh green broccoli crowns packed with vitamins.',
  },
  {
    id: 'v2',
    name: 'Organic Roma Tomatoes',
    category: 'vegetables',
    price: 2.99,
    weight: '1 kg',
    emoji: '🍅',
    rating: 4.5,
    description: 'Plump and juicy tomatoes, ideal for salads or sauces.',
  },
  {
    id: 'v3',
    name: 'Baby Spinach Leaves',
    category: 'vegetables',
    price: 1.99,
    weight: '150g pack',
    emoji: '🥬',
    rating: 4.8,
    description: 'Pre-washed tender baby spinach leaves ready to eat.',
  },

  // Dairy & Eggs
  {
    id: 'd1',
    name: 'Whole Milk 3.25%',
    category: 'dairy',
    price: 3.49,
    weight: '1 Gallon',
    emoji: '🥛',
    rating: 4.7,
    description: 'Nutritious pasteurized whole milk from local dairy farms.',
  },
  {
    id: 'd2',
    name: 'Large Free Range Eggs',
    category: 'dairy',
    price: 4.29,
    weight: '12 pcs',
    emoji: '🥚',
    rating: 4.9,
    description: 'Grade A farm fresh free-range large brown eggs.',
  },

  // Bakery
  {
    id: 'b1',
    name: 'Sourdough Bread Loaf',
    category: 'bakery',
    price: 4.99,
    weight: '500g',
    emoji: '🍞',
    rating: 4.8,
    description: 'Freshly baked rustic sourdough bread with a crispy crust.',
  },
  {
    id: 'b2',
    name: 'Butter Croissants',
    category: 'bakery',
    price: 3.99,
    weight: '4 pack',
    emoji: '🥐',
    rating: 4.6,
    description: 'Flaky, buttery bakery-style croissants.',
  },

  // Beverages
  {
    id: 'bev1',
    name: 'Fresh Orange Juice',
    category: 'beverages',
    price: 4.99,
    weight: '1 Liter',
    emoji: '🍊',
    rating: 4.7,
    description: '100% cold-pressed orange juice with pulp.',
  },

  // Snacks
  {
    id: 's1',
    name: 'Salted Tortilla Chips',
    category: 'snacks',
    price: 3.29,
    weight: '300g bag',
    emoji: '🌮',
    rating: 4.5,
    description: 'Crispy stone-ground corn tortilla chips seasoned with sea salt.',
  },
];
