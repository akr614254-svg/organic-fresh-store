import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { categories } from '../data/vegetables'

export default function Categories() {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-5 md:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-wide text-leaf">Shop by category</span>
          <h2 className="font-display text-3xl text-forest font-semibold mt-1">What's in season</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              to={`/shop?category=${c.id}`}
              className="group rounded-3xl border border-forest/10 bg-white p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all"
            >
              <div className={`w-16 h-16 rounded-full ${c.tint} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                {c.emoji}
              </div>
              <span className="font-medium text-charcoal">{c.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
