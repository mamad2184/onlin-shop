import { useEffect, useRef, useState } from 'react'

function Toast({ message, action = null, onClose, trigger = 0 }) {
  const [vibrating, setVibrating] = useState(false)
  const onCloseRef = useRef(onClose)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!message) return undefined

    setVibrating(true)

    const vibrationTimer = window.setTimeout(() => {
      setVibrating(false)
    }, 500)

    const dismissTimer = window.setTimeout(() => {
      onCloseRef.current()
    }, 10000)

    return () => {
      window.clearTimeout(vibrationTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [message, trigger])

  const replayVibration = () => {
    setVibrating(false)

    window.requestAnimationFrame(() => {
      setVibrating(true)
    })
  }

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      onPointerDown={replayVibration}
      className={`fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-xl items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/10 bg-slate-950/95 px-4 py-3.5 text-sm text-white shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:left-auto sm:right-6 sm:max-w-md ${
        vibrating ? 'toast--vibrate' : ''
      }`}
    >
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]"
        aria-hidden="true"
      />

      <p className="min-w-0 flex-1 break-words leading-5 text-slate-100">
        {message}
      </p>

      {action ? (
        <div className="shrink-0 text-sm font-semibold text-white">
          {action}
        </div>
      ) : null}

      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition duration-200 hover:bg-white/10 hover:text-white active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6l12 12M18 6 6 18"
          />
        </svg>
      </button>
    </div>
  )
}

export default Toast