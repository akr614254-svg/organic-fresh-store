export default function Footer() {
  return (
    <footer className="bg-forest text-cream/80 mt-10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-lg text-cream">
          <span>🌱</span> Organic<span className="text-sprout">Fresh</span>
        </div>
        <p className="text-xs text-cream/50">© {new Date().getFullYear()} Organic Fresh. Farm to door, every day.</p>
      </div>
    </footer>
  )
}
