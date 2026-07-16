import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, setTokens, logout } from '../lib/api'

function AuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('login')
  const token = localStorage.getItem('access_token')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      if (mode === 'login') {
        const data = await loginUser(username, password)
        if (data.access) {
          setTokens(data.access)
          setMessage('Logged in successfully.')
          setTimeout(() => navigate('/'), 500)
          return
        }
        setMessage('Login failed. Check credentials.')
      } else {
        const data = await registerUser(username, password)
        setMessage(data.message || data.massage || data.detail || 'Registration completed.')
        if (data.message || data.massage) {
          setTimeout(() => navigate('/auth'), 500)
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.detail || 'Request failed.')
    }
  }

  const handleLogout = () => {
    logout()
    setMessage('Logged out successfully.')
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{mode === 'login' ? 'Login' : 'Register'}</h1>
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm font-medium text-slate-700 underline"
        >
          {mode === 'login' ? 'Create an account' : 'Use existing account'}
        </button>
      </div>
      {message ? <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div> : null}
      {token ? (
        <div className="space-y-4">
          <p className="text-slate-700">You are currently logged in.</p>
          <button
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      )}
    </div>
  )}

export default AuthPage
