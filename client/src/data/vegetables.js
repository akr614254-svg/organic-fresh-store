// Catalog data. Swap `emoji` for real product photos once the upload
// pipeline (Cloudinary) is wired up in a later phase.

export const categories = [
  { id: 'leafy', name: 'Leafy Greens', emoji: '🥬', tint: 'bg-sprout/60' },
  { id: 'root', name: 'Root Veg', emoji: '🥕', tint: 'bg-turmeric/30' },
  { id: 'fruits', name: 'Veg Fruits', emoji: '🍅', tint: 'bg-red-100' },
  { id: 'herbs', name: 'Herbs', emoji: '🌿', tint: 'bg-sprout/40' },
]

export const vegetables = [
  // Leafy Greens
  { id: 1, name: 'Spinach (Palak)', category: 'leafy', emoji: '🥬', price: 28, unit: '500 g', rating: 4.6, badge: 'Fresh Today', desc: 'Tender, deep-green spinach leaves picked at dawn. Great in saag, soups, or a quick sauté.' },
  { id: 2, name: 'Fenugreek (Methi)', category: 'leafy', emoji: '🥬', price: 18, unit: '250 g', rating: 4.2, badge: null, desc: 'Slightly bitter, aromatic leaves used in methi thepla, parathas, and curries.' },
  { id: 3, name: 'Cabbage', category: 'leafy', emoji: '🥬', price: 24, unit: '1 kg', rating: 4.3, badge: null, desc: 'Crisp, tightly packed cabbage heads — perfect for stir-fries and salads.' },
  { id: 4, name: 'Lettuce', category: 'leafy', emoji: '🥬', price: 45, unit: '250 g', rating: 4.5, badge: 'New', desc: 'Crunchy, mild-flavoured lettuce for salads, wraps, and burgers.' },
  { id: 5, name: 'Amaranth (Chaulai)', category: 'leafy', emoji: '🥬', price: 20, unit: '250 g', rating: 4.1, badge: null, desc: 'Iron-rich amaranth leaves, delicious in a simple garlic sauté.' },
  { id: 6, name: 'Mustard Greens (Sarson)', category: 'leafy', emoji: '🥬', price: 22, unit: '250 g', rating: 4.4, badge: null, desc: 'Classic base for sarson ka saag — earthy and slightly peppery.' },
  { id: 7, name: 'Bottle Gourd Leaves', category: 'leafy', emoji: '🥬', price: 16, unit: '250 g', rating: 4.0, badge: null, desc: 'Mild, tender greens often used in traditional home-style curries.' },
  { id: 8, name: 'Spring Onion', category: 'leafy', emoji: '🥬', price: 15, unit: '150 g', rating: 4.3, badge: null, desc: 'Fresh, mild-flavoured stalks — perfect as a garnish or stir-fry addition.' },

  // Root Vegetables
  { id: 9, name: 'Carrot', category: 'root', emoji: '🥕', price: 34, unit: '1 kg', rating: 4.7, badge: null, desc: 'Sweet, crunchy carrots — great raw, juiced, or roasted.' },
  { id: 10, name: 'Beetroot', category: 'root', emoji: '🍠', price: 30, unit: '500 g', rating: 4.3, badge: null, desc: 'Earthy-sweet beets, ideal for salads, juices, or roasting.' },
  { id: 11, name: 'Potato', category: 'root', emoji: '🥔', price: 20, unit: '1 kg', rating: 4.6, badge: 'Best Seller', desc: 'All-purpose potatoes, perfect for curries, fries, and mash.' },
  { id: 12, name: 'Onion', category: 'root', emoji: '🧅', price: 26, unit: '1 kg', rating: 4.5, badge: null, desc: 'The everyday base for Indian cooking — pungent and full-flavoured.' },
  { id: 13, name: 'Radish (Mooli)', category: 'root', emoji: '🥕', price: 18, unit: '500 g', rating: 4.0, badge: null, desc: 'Crisp and peppery — great in parathas or as a crunchy salad.' },
  { id: 14, name: 'Sweet Potato', category: 'root', emoji: '🍠', price: 36, unit: '1 kg', rating: 4.4, badge: null, desc: 'Naturally sweet, roasts beautifully, and works well in curries.' },
  { id: 15, name: 'Turnip (Shalgam)', category: 'root', emoji: '🥕', price: 22, unit: '500 g', rating: 3.9, badge: null, desc: 'Mild, slightly sweet root vegetable, great in winter stews.' },
  { id: 16, name: 'Ginger', category: 'root', emoji: '🫚', price: 60, unit: '250 g', rating: 4.6, badge: null, desc: 'Fresh, fibrous ginger root — essential for tea, curries, and stir-fries.' },
  { id: 17, name: 'Garlic', category: 'root', emoji: '🧄', price: 55, unit: '250 g', rating: 4.7, badge: null, desc: 'Punchy, aromatic garlic bulbs for everyday cooking.' },
  { id: 18, name: 'Yam (Suran)', category: 'root', emoji: '🍠', price: 32, unit: '500 g', rating: 4.0, badge: null, desc: 'Starchy and hearty — a staple in fry and curry preparations.' },

  // Vegetable Fruits
  { id: 19, name: 'Tomato', category: 'fruits', emoji: '🍅', price: 22, unit: '1 kg', rating: 4.4, badge: 'Best Seller', desc: 'Juicy, tangy tomatoes — the backbone of every Indian gravy.' },
  { id: 20, name: 'Capsicum', category: 'fruits', emoji: '🫑', price: 40, unit: '500 g', rating: 4.5, badge: null, desc: 'Crisp bell peppers with a sweet, mild crunch — great in stir-fries.' },
  { id: 21, name: 'Brinjal (Eggplant)', category: 'fruits', emoji: '🍆', price: 28, unit: '500 g', rating: 4.2, badge: null, desc: 'Glossy purple brinjal, perfect for baingan bharta or curry.' },
  { id: 22, name: 'Cucumber', category: 'fruits', emoji: '🥒', price: 24, unit: '500 g', rating: 4.5, badge: null, desc: 'Cool, crisp cucumbers — great in salads and raitas.' },
  { id: 23, name: 'Bottle Gourd (Lauki)', category: 'fruits', emoji: '🥒', price: 20, unit: '1 pc', rating: 4.0, badge: null, desc: 'Mild and light — a monsoon favourite for curries and koftas.' },
  { id: 24, name: 'Bitter Gourd (Karela)', category: 'fruits', emoji: '🥒', price: 30, unit: '500 g', rating: 3.8, badge: null, desc: 'Distinctly bitter, prized for its health benefits and bold flavour.' },
  { id: 25, name: 'Okra (Bhindi)', category: 'fruits', emoji: '🫛', price: 32, unit: '500 g', rating: 4.3, badge: null, desc: 'Tender okra pods, ideal for a crisp bhindi fry.' },
  { id: 26, name: 'Green Peas', category: 'fruits', emoji: '🫛', price: 45, unit: '500 g', rating: 4.6, badge: 'Fresh Today', desc: 'Sweet, plump peas — perfect for pulao, curries, or snacking.' },
  { id: 27, name: 'Pumpkin', category: 'fruits', emoji: '🎃', price: 26, unit: '1 kg', rating: 4.1, badge: null, desc: 'Sweet, dense pumpkin — great roasted or in a light curry.' },
  { id: 28, name: 'Green Chilli', category: 'fruits', emoji: '🌶️', price: 12, unit: '100 g', rating: 4.4, badge: null, desc: 'Sharp, fiery chillies to bring heat to any dish.' },

  // Herbs
  { id: 29, name: 'Coriander (Dhaniya)', category: 'herbs', emoji: '🌿', price: 10, unit: '100 g', rating: 4.5, badge: null, desc: 'Fragrant leaves used as a finishing garnish across Indian cuisine.' },
  { id: 30, name: 'Mint (Pudina)', category: 'herbs', emoji: '🌿', price: 8, unit: '100 g', rating: 4.6, badge: 'Fresh Today', desc: 'Cooling, aromatic mint — perfect for chutneys and raitas.' },
  { id: 31, name: 'Curry Leaves', category: 'herbs', emoji: '🌿', price: 6, unit: '50 g', rating: 4.4, badge: null, desc: 'Essential South Indian tempering herb with a distinct citrusy aroma.' },
  { id: 32, name: 'Basil (Tulsi)', category: 'herbs', emoji: '🌿', price: 14, unit: '50 g', rating: 4.3, badge: null, desc: 'Sweet, peppery basil — used in teas, garnishes, and Italian dishes.' },
]

// Powers the "Mandi Ticker" signature strip — mimics a live wholesale
// market rate board (mandi bhav) that scrolls across the hero.
export const mandiRates = [
  { name: 'Tomato', price: 22 },
  { name: 'Onion', price: 26 },
  { name: 'Potato', price: 20 },
  { name: 'Spinach', price: 28 },
  { name: 'Carrot', price: 34 },
  { name: 'Capsicum', price: 40 },
  { name: 'Coriander', price: 10 },
  { name: 'Beetroot', price: 30 },
]
