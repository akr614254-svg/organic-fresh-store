export default function About() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <span className="text-xs font-mono uppercase tracking-wide text-leaf">Our story</span>
      <h1 className="font-display text-3xl md:text-4xl text-forest font-semibold mt-1 mb-6">
        Fresh from the farm, straight to your door
      </h1>

      <div className="flex flex-col gap-4 text-charcoal/70 leading-relaxed">
        <p>
          Organic Fresh works directly with local farms to bring leafy greens,
          root vegetables, herbs, and vegetable fruits to your kitchen the
          same day they're harvested — no long cold-storage chain, no
          middle-mandi markup.
        </p>
        <p>
          Every order is packed by hand and delivered within a 90-minute
          window you choose, so what arrives is as close to farm-fresh as a
          delivery can get.
        </p>
        <p>
          We're a small team obsessed with two things: produce quality, and
          making grocery shopping for vegetables feel effortless.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-10">
        <div className="bg-white border border-forest/10 rounded-2xl p-5 text-center">
          <div className="text-2xl mb-1">🌾</div>
          <div className="font-display text-lg text-forest">32+</div>
          <div className="text-xs text-charcoal/50">Farm items</div>
        </div>
        <div className="bg-white border border-forest/10 rounded-2xl p-5 text-center">
          <div className="text-2xl mb-1">🚚</div>
          <div className="font-display text-lg text-forest">90 min</div>
          <div className="text-xs text-charcoal/50">Delivery slots</div>
        </div>
        <div className="bg-white border border-forest/10 rounded-2xl p-5 text-center">
          <div className="text-2xl mb-1">🌱</div>
          <div className="font-display text-lg text-forest">100%</div>
          <div className="text-xs text-charcoal/50">Organic sourced</div>
        </div>
      </div>
    </section>
  )
}
