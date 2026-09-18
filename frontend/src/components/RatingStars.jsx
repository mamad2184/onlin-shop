function RatingStars({ value = 0, count = null, interactive = false, onChange }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0))
  const roundedRating = Math.round(rating)

  return (
    <div className="flex items-center gap-2" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <div className="flex" role={interactive ? 'radiogroup' : undefined}>
        {[1, 2, 3, 4, 5].map((star) => {
          const content = star <= roundedRating ? '★' : '☆'
          const className = star <= roundedRating
            ? 'text-amber-400'
            : 'text-slate-300'

          if (!interactive) {
            return <span key={star} className={`text-xl leading-none ${className}`}>{content}</span>
          }

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === roundedRating}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              onClick={() => onChange(star)}
              className={`text-3xl leading-none transition hover:scale-110 ${className}`}
            >
              {content}
            </button>
          )
        })}
      </div>
      {count !== null ? <span className="text-xs text-slate-500">({count})</span> : null}
    </div>
  )
}

export default RatingStars