const STEPS = [
  { key: 'placed', label: 'Placed', icon: '🧾' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🏡' },
]

export default function OrderStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
        <span>✕</span> This order was cancelled
      </div>
    )
  }

  const activeIndex = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex
        const isLast = i === STEPS.length - 1
        return (
          <div key={step.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                  done ? 'bg-forest text-cream' : 'bg-charcoal/10 text-charcoal/30'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] text-center w-16 leading-tight ${done ? 'text-forest font-medium' : 'text-charcoal/40'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${i < activeIndex ? 'bg-forest' : 'bg-charcoal/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
