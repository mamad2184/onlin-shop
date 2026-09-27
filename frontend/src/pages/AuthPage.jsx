import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, setTokens, logout } from '../lib/api'
import Toast from '../components/Toast'

function AuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [toastTrigger, setToastTrigger] = useState(0)
  const [mode, setMode] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const token = localStorage.getItem('access_token')
  const navigate = useNavigate()

  const notify = (nextMessage) => {
    setMessage(nextMessage)
    setToastTrigger((current) => current + 1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)

    try {
      if (mode === 'login') {
        const data = await loginUser(username, password)

        if (data.access) {
          setTokens(data.access)
          notify('Logged in successfully.')
          setTimeout(() => navigate('/'), 500)
          return
        }

        notify('Login failed. Check credentials.')
      } else {
        const data = await registerUser(username, password)

        notify(
          data.message ||
            data.massage ||
            data.detail ||
            'Registration completed.',
        )

        if (data.message || data.massage) {
          setTimeout(() => navigate('/auth'), 500)
        }
      }
    } catch (error) {
      notify(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          'Request failed.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    notify('Logged out successfully.')
  }

  const isLogin = mode === 'login'

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-slate-700/40 blur-3xl" />

          <div className="relative">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black tracking-tight text-slate-950 shadow-lg">
              C&S
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              cloth&shoe
            </p>

            <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
              Everything you like,
              <span className="block text-slate-400">in one place.</span>
            </h2>
          </div>

          <div className="relative">
            <div className="mb-4 h-px w-16 bg-white/20" />
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Sign in to keep track of your basket and continue exploring
              modern essentials.
            </p>
          </div>
        </div>

        {/* Auth panel */}
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:hidden">
                cloth&shoe
              </div>

              <p className="mb-2 text-sm font-medium text-slate-500">
                {isLogin ? 'Welcome back' : 'Get started'}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {isLogin ? 'Login' : 'Create account'}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? 'Enter your details to access your account.'
                  : 'Create an account and start building your basket.'}
              </p>
            </div>

            {!token && (
              <button
                type="button"
                onClick={() => setMode(isLogin ? 'register' : 'login')}
                disabled={submitting}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            )}
          </div>

          <Toast
            message={message}
            trigger={toastTrigger}
            onClose={() => setMessage('')}
          />

          {token ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-slate-950">
                You’re logged in
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your account is currently active on this device.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-700 hover:shadow-md active:scale-[0.99]"
              >
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                      />
                    </svg>
                  </div>

                  <input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 10.5V8.25a4.5 4.5 0 1 1 9 0v2.25M6 10.5h12v9H6v-9Z"
                      />
                    </svg>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    placeholder="Enter your password"
                    autoComplete={
                      isLogin ? 'current-password' : 'new-password'
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-slate-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-950 disabled:hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                      />
                    </svg>

                    <span>
                      {isLogin ? 'Logging in...' : 'Creating account...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {isLogin ? 'Login' : 'Create account'}
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-medium text-slate-400">
                    {isLogin ? 'New here?' : 'Already have an account?'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode(isLogin ? 'register' : 'login')}
                disabled={submitting}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLogin ? 'Create an account' : 'Use existing account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage