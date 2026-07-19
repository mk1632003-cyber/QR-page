export interface Topping {
  id: string;
  name: string;
  category: 'sauce' | 'cheese' | 'meat' | 'veggie' | 'drizzle';
  price: number;
  color: string;
  icon: string;
}

export interface PizzaPreset {
  id: string;
  name: string;
  subtitle: string;
  basePrice: number;
  description: string;
  defaultToppings: string[]; // List of topping IDs
  sauceType: 'tomato' | 'bianca' | 'pesto';
  spiciness: number; // 0 to 3
  bgGradient: string; // Tailwind gradient for presentation card
  textColor: string;
}

export interface PizzaCustomization {
  presetId: string;
  selectedToppings: string[];
  crustType: 'neapolitan' | 'thin-crust' | 'gluten-free';
  cheeseLevel: 'none' | 'light' | 'regular' | 'extra';
  bakeStyle: 'regular' | 'well-done' | 'charred';
  size: 'personal' | 'medium' | 'large';
}

export const TOPPINGS: Topping[] = [
  { id: 'mozzarella', name: 'Fior di Latte', category: 'cheese', price: 1.5, color: '#fbf8eb', icon: '🧀' },
  { id: 'gorgonzola', name: 'Gorgonzola Dolce', category: 'cheese', price: 2.0, color: '#d0dfd4', icon: '🧀' },
  { id: 'ricotta', name: 'Whipped Ricotta', category: 'cheese', price: 1.5, color: '#ffffff', icon: '🥛' },
  { id: 'parmesan', name: 'Parmigiano-Reggiano', category: 'cheese', price: 1.0, color: '#f3ebd4', icon: '🧀' },
  { id: 'pepperoni', name: 'Spicy Pepperoni', category: 'meat', price: 2.0, color: '#b91c1c', icon: '🍕' },
  { id: 'nduja', name: 'Spicy \'Nduja', category: 'meat', price: 2.5, color: '#991b1b', icon: '🔥' },
  { id: 'basil', name: 'Fresh Basil', category: 'veggie', price: 0.5, color: '#15803d', icon: '🌿' },
  { id: 'mushrooms', name: 'Wild Porcini', category: 'veggie', price: 2.0, color: '#a1a1aa', icon: '🍄' },
  { id: 'olives', name: 'Kalamata Olives', category: 'veggie', price: 1.0, color: '#1e1b4b', icon: '🫒' },
  { id: 'onions', name: 'Caramelized Onion', category: 'veggie', price: 1.0, color: '#701a75', icon: '🧅' },
  { id: 'walnuts', name: 'Toasted Walnuts', category: 'veggie', price: 1.5, color: '#b45309', icon: '🥜' },
  { id: 'hot_honey', name: 'Spiced Hot Honey', category: 'drizzle', price: 1.5, color: '#eab308', icon: '🍯' },
  { id: 'truffle_oil', name: 'White Truffle Oil', category: 'drizzle', price: 3.0, color: '#ca8a04', icon: '✨' },
];

export const PRESETS: PizzaPreset[] = [
  {
    id: 'margherita',
    name: 'Margherita Classica',
    subtitle: 'The timeless Neapolitan masterpiece',
    basePrice: 14.0,
    description: 'Crushed San Marzano tomatoes, fresh fior di latte mozzarella, fragrant hand-torn basil leaves, and an elegant swirl of premium extra-virgin olive oil.',
    defaultToppings: ['mozzarella', 'basil'],
    sauceType: 'tomato',
    spiciness: 0,
    bgGradient: 'from-[#45120e] to-[#120403]',
    textColor: 'text-amber-100',
  },
  {
    id: 'diavola',
    name: 'Diavola Piccante',
    subtitle: 'A fiery, smoky indulgence',
    basePrice: 16.5,
    description: 'Artisanal spicy Calabrian pepperoni slices, dollops of spreadable \'nduja, fresh mozzarella, scattered black olives, red chili flakes, and a finishing drizzle of sweet hot honey.',
    defaultToppings: ['mozzarella', 'pepperoni', 'nduja', 'olives', 'hot_honey'],
    sauceType: 'tomato',
    spiciness: 3,
    bgGradient: 'from-[#600d07] to-[#180201]',
    textColor: 'text-orange-100',
  },
  {
    id: 'quattro',
    name: 'Quattro Formaggi',
    subtitle: 'Creamy, rich four-cheese dream',
    basePrice: 18.0,
    description: 'A decadent white canvas layered with aged Parmigiano-Reggiano, creamy whipped ricotta, sweet Gorgonzola Dolce, and fresh mozzarella, finished with toasted walnuts and truffle honey.',
    defaultToppings: ['mozzarella', 'gorgonzola', 'ricotta', 'parmesan', 'walnuts'],
    sauceType: 'bianca',
    spiciness: 0,
    bgGradient: 'from-[#4c4228] to-[#15120a]',
    textColor: 'text-amber-50',
  },
  {
    id: 'ortolana',
    name: 'Ortolana Primavera',
    subtitle: 'Fresh garden vegetable harmony',
    basePrice: 15.5,
    description: 'Fragrantly rich basil pesto base, fresh mozzarella, charred bell peppers, caramelized balsamic onions, mushrooms, and Kalamata olives, topped with cold-pressed olive oil.',
    defaultToppings: ['mozzarella', 'basil', 'mushrooms', 'olives', 'onions'],
    sauceType: 'pesto',
    spiciness: 0,
    bgGradient: 'from-[#143d22] to-[#05140a]',
    textColor: 'text-emerald-100',
  },
  {
    id: 'tartufo',
    name: 'Tartufo e Funghi',
    subtitle: 'Earthy luxury with wild mushrooms',
    basePrice: 19.5,
    description: 'White cream base with caramelized sweet onions, wild porcini and cremini mushrooms, melted fior di latte, aged Parmigiano-Reggiano, fresh thyme, and luxurious white truffle oil.',
    defaultToppings: ['mozzarella', 'parmesan', 'mushrooms', 'onions', 'truffle_oil'],
    sauceType: 'bianca',
    spiciness: 1,
    bgGradient: 'from-[#3c3630] to-[#110e0c]',
    textColor: 'text-stone-200',
  },
];
