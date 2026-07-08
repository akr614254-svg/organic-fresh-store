import { motion } from 'framer-motion'

const floaters = [
  { emoji: '🥬', top: '8%', left: '58%', delay: 0, size: 'text-6xl' },
  { emoji: '🥕', top: '38%', left: '78%', delay: 0.8, size: 'text-7xl' },
  { emoji: '🍅', top: '62%', left: '55%', delay: 1.4, size: 'text-5xl' },
  { emoji: '🌿', top: '20%', left: '82%', delay: 2, size: 'text-4xl' },
]

export default function Hero() {
  return (
    <section id="home" className="relative max-w-7xl mx-auto px-5 md:px-8 pt-14 pb-20 grid md:grid-cols-2 gap-10 items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block bg-sprout/50 text-forest text-xs font-mono uppercase tracking-wide px-3 py-1 rounded-full mb-5">
          Harvested this morning
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-forest font-semibold">
          From the soil to
          <br />
          your kitchen,
          <br />
          <span className="text-leaf italic">same day.</span>
        </h1>
        <p className="mt-5 text-charcoal/70 max-w-md">
          Organic Fresh sources leafy greens, roots, herbs, and vegetable
          fruits straight from local farms — no middle mandi, no wilting on
          a shelf.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex items-center bg-white rounded-full shadow-sm border border-forest/10 p-1.5 max-w-md"
        >
          <input
            type="text"
            placeholder="Search spinach, carrots, mint..."
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-charcoal/40"
          />
          <button
            type="submit"
            className="bg-leaf text-cream text-sm font-medium px-5 py-2.5 rounded-full hover:bg-forest transition-colors"
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex items-center gap-6 text-sm text-charcoal/60">
          <span>🚚 90-min delivery slots</span>
          <span>🌾 30+ farm items</span>
        </div>
      </motion.div>

      <div className="relative h-[360px] md:h-[440px] hidden md:block">
        <div className="absolute inset-0 rounded-blob bg-sprout/50" />
        <div className="absolute inset-8 rounded-blob bg-cream/70" />
        {floaters.map((f, i) => (
          <motion.span
            key={i}
            className={`absolute ${f.size} animate-floaty select-none`}
            style={{ top: f.top, left: f.left, animationDelay: `${f.delay}s` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + f.delay * 0.2 }}
          >
            {f.emoji}
          </motion.span>
        ))}
      </div>
    </section>
  )
}
