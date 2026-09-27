function RatingStars({
  value = 0,
  count = null,
  interactive = false,
  onChange,
}) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0))
  const roundedRating = Math.round(rating)

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <div
        className="flex items-center"
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? 'Choose a rating' : undefined}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= roundedRating
          const content = filled ? '★' : '☆'

          if (!interactive) {
            return (
              <span
                key={star}
                aria-hidden="true"
                className={`text-lg leading-none transition sm:text-xl ${
                  filled ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {content}
              </span>
            )
          }

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === roundedRating}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              onClick={() => onChange(star)}
              className={`rounded-lg px-0.5 text-2xl leading-none transition duration-200 hover:-translate-y-0.5 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-3xl ${
                filled ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
              }`}
            >
              {content}
            </button>
          )
        })}
      </div>

      {count !== null ? (
        <span className="text-xs font-medium text-slate-500">
          ({count})
        </span>
      ) : null}
    </div>
  )
}

export default RatingStars