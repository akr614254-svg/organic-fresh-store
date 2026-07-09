// Renders 5 stars. Read-only by default (for showing an average rating);
// pass `interactive` + `onChange` to make it a clickable rating picker.
export default function StarRating({ value = 0, onChange, interactive = false, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {stars.map((n) => {
        const filled = n <= Math.round(value)
        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className={`leading-none transition-colors ${filled ? 'text-turmeric' : 'text-charcoal/20'} hover:text-turmeric`}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ) : (
          <span key={n} className={`leading-none ${filled ? 'text-turmeric' : 'text-charcoal/20'}`}>
            ★
          </span>
        )
      })}
    </div>
  )
}
