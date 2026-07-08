import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Product from '../models/Product.js'

// Mirrors client/src/data/vegetables.js so the API serves the same catalog
// the frontend was already designed around.
const products = [
  { name: 'Spinach (Palak)', category: 'leafy', emoji: '🥬', price: 28, unit: '500 g', rating: 4.6, badge: 'Fresh Today', desc: 'Tender, deep-green spinach leaves picked at dawn. Great in saag, soups, or a quick sauté.' },
  { name: 'Fenugreek (Methi)', category: 'leafy', emoji: '🥬', price: 18, unit: '250 g', rating: 4.2, desc: 'Slightly bitter, aromatic leaves used in methi thepla, parathas, and curries.' },
  { name: 'Cabbage', category: 'leafy', emoji: '🥬', price: 24, unit: '1 kg', rating: 4.3, desc: 'Crisp, tightly packed cabbage heads — perfect for stir-fries and salads.' },
  { name: 'Lettuce', category: 'leafy', emoji: '🥬', price: 45, unit: '250 g', rating: 4.5, badge: 'New', desc: 'Crunchy, mild-flavoured lettuce for salads, wraps, and burgers.' },
  { name: 'Amaranth (Chaulai)', category: 'leafy', emoji: '🥬', price: 20, unit: '250 g', rating: 4.1, desc: 'Iron-rich amaranth leaves, delicious in a simple garlic sauté.' },
  { name: 'Mustard Greens (Sarson)', category: 'leafy', emoji: '🥬', price: 22, unit: '250 g', rating: 4.4, desc: 'Classic base for sarson ka saag — earthy and slightly peppery.' },
  { name: 'Bottle Gourd Leaves', category: 'leafy', emoji: '🥬', price: 16, unit: '250 g', rating: 4.0, desc: 'Mild, tender greens often used in traditional home-style curries.' },
  { name: 'Spring Onion', category: 'leafy', emoji: '🥬', price: 15, unit: '150 g', rating: 4.3, desc: 'Fresh, mild-flavoured stalks — perfect as a garnish or stir-fry addition.' },

  { name: 'Carrot', category: 'root', emoji: '🥕', price: 34, unit: '1 kg', rating: 4.7, desc: 'Sweet, crunchy carrots — great raw, juiced, or roasted.' },
  { name: 'Beetroot', category: 'root', emoji: '🍠', price: 30, unit: '500 g', rating: 4.3, desc: 'Earthy-sweet beets, ideal for salads, juices, or roasting.' },
  { name: 'Potato', category: 'root', emoji: '🥔', price: 20, unit: '1 kg', rating: 4.6, badge: 'Best Seller', desc: 'All-purpose potatoes, perfect for curries, fries, and mash.' },
  { name: 'Onion', category: 'root', emoji: '🧅', price: 26, unit: '1 kg', rating: 4.5, desc: 'The everyday base for Indian cooking — pungent and full-flavoured.' },
  { name: 'Radish (Mooli)', category: 'root', emoji: '🥕', price: 18, unit: '500 g', rating: 4.0, desc: 'Crisp and peppery — great in parathas or as a crunchy salad.' },
  { name: 'Sweet Potato', category: 'root', emoji: '🍠', price: 36, unit: '1 kg', rating: 4.4, desc: 'Naturally sweet, roasts beautifully, and works well in curries.' },
  { name: 'Turnip (Shalgam)', category: 'root', emoji: '🥕', price: 22, unit: '500 g', rating: 3.9, desc: 'Mild, slightly sweet root vegetable, great in winter stews.' },
  { name: 'Ginger', category: 'root', emoji: '🫚', price: 60, unit: '250 g', rating: 4.6, desc: 'Fresh, fibrous ginger root — essential for tea, curries, and stir-fries.' },
  { name: 'Garlic', category: 'root', emoji: '🧄', price: 55, unit: '250 g', rating: 4.7, desc: 'Punchy, aromatic garlic bulbs for everyday cooking.' },
  { name: 'Yam (Suran)', category: 'root', emoji: '🍠', price: 32, unit: '500 g', rating: 4.0, desc: 'Starchy and hearty — a staple in fry and curry preparations.' },

  { name: 'Tomato', category: 'fruits', emoji: '🍅', price: 22, unit: '1 kg', rating: 4.4, badge: 'Best Seller', desc: 'Juicy, tangy tomatoes — the backbone of every Indian gravy.' },
  { name: 'Capsicum', category: 'fruits', emoji: '🫑', price: 40, unit: '500 g', rating: 4.5, desc: 'Crisp bell peppers with a sweet, mild crunch — great in stir-fries.' },
  { name: 'Brinjal (Eggplant)', category: 'fruits', emoji: '🍆', price: 28, unit: '500 g', rating: 4.2, desc: 'Glossy purple brinjal, perfect for baingan bharta or curry.' },
  { name: 'Cucumber', category: 'fruits', emoji: '🥒', price: 24, unit: '500 g', rating: 4.5, desc: 'Cool, crisp cucumbers — great in salads and raitas.' },
  { name: 'Bottle Gourd (Lauki)', category: 'fruits', emoji: '🥒', price: 20, unit: '1 pc', rating: 4.0, desc: 'Mild and light — a monsoon favourite for curries and koftas.' },
  { name: 'Bitter Gourd (Karela)', category: 'fruits', emoji: '🥒', price: 30, unit: '500 g', rating: 3.8, desc: 'Distinctly bitter, prized for its health benefits and bold flavour.' },
  { name: 'Okra (Bhindi)', category: 'fruits', emoji: '🫛', price: 32, unit: '500 g', rating: 4.3, desc: 'Tender okra pods, ideal for a crisp bhindi fry.' },
  { name: 'Green Peas', category: 'fruits', emoji: '🫛', price: 45, unit: '500 g', rating: 4.6, badge: 'Fresh Today', desc: 'Sweet, plump peas — perfect for pulao, curries, or snacking.' },
  { name: 'Pumpkin', category: 'fruits', emoji: '🎃', price: 26, unit: '1 kg', rating: 4.1, desc: 'Sweet, dense pumpkin — great roasted or in a light curry.' },
  { name: 'Green Chilli', category: 'fruits', emoji: '🌶️', price: 12, unit: '100 g', rating: 4.4, desc: 'Sharp, fiery chillies to bring heat to any dish.' },

  { name: 'Coriander (Dhaniya)', category: 'herbs', emoji: '🌿', price: 10, unit: '100 g', rating: 4.5, desc: 'Fragrant leaves used as a finishing garnish across Indian cuisine.' },
  { name: 'Mint (Pudina)', category: 'herbs', emoji: '🌿', price: 8, unit: '100 g', rating: 4.6, badge: 'Fresh Today', desc: 'Cooling, aromatic mint — perfect for chutneys and raitas.' },
  { name: 'Curry Leaves', category: 'herbs', emoji: '🌿', price: 6, unit: '50 g', rating: 4.4, desc: 'Essential South Indian tempering herb with a distinct citrusy aroma.' },
  { name: 'Basil (Tulsi)', category: 'herbs', emoji: '🌿', price: 14, unit: '50 g', rating: 4.3, desc: 'Sweet, peppery basil — used in teas, garnishes, and Italian dishes.' },
]

async function run() {
  await connectDB()
  await Product.deleteMany({})
  const withLegacyIds = products.map((p, i) => ({ ...p, legacyId: i + 1 }))
  await Product.insertMany(withLegacyIds)
  console.log(`Seeded ${products.length} products.`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
