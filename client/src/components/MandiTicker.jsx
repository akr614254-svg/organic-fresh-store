import { mandiRates } from '../data/vegetables'

export default function MandiTicker() {
  // Duplicate the list so the marquee loops seamlessly.
  const row = [...mandiRates, ...mandiRates]

  return (
    <div className="bg-forest text-sprout overflow-hidden border-y border-leaf/40">
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono uppercase tracking-wide text-turmeric bg-forest/60 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-turmeric animate-pulse" />
        Today&rsquo;s Mandi Rate
      </div>
      <div className="relative flex overflow-hidden py-2">
        <div className="flex animate-marquee whitespace-nowrap font-mono text-sm gap-10 pr-10">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sprout/70" />
              {item.name}
              <span className="text-turmeric">₹{item.price}/kg</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
