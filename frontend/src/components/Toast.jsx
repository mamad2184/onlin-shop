import { useEffect, useRef, useState } from 'react'

function Toast({ message, action = null, onClose, trigger = 0 }) {
  const [vibrating, setVibrating] = useState(false)
  const onCloseRef = useRef(onClose)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!message) return undefined

    setVibrating(true)
    const vibrationTimer = window.setTimeout(() => setVibrating(false), 500)
    const dismissTimer = window.setTimeout(() => onCloseRef.current(), 10000)

    return () => {
      window.clearTimeout(vibrationTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [message, trigger])

  const replayVibration = () => {
    setVibrating(false)
    window.requestAnimationFrame(() => setVibrating(true))
  }

  if (!message) return null

  return (
    <div
      role="alert"
      onPointerDown={replayVibration}
      className={`fixed inset-x-4 top-4 z-50 mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl sm:left-auto sm:right-6 sm:max-w-md ${vibrating ? 'toast--vibrate' : ''}`}
    >
      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words">{message}</p>
      {action}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        aria-label="Dismiss notification"
        className="shrink-0 text-lg leading-none text-slate-300 hover:text-white"
      >
        &times;
      </button>
    </div>
  )
}

export default Toast