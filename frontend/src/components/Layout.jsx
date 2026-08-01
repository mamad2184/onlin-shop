import { Link } from 'react-router-dom'
import { useState } from 'react'

function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-semibold text-slate-900">
            Django REST Shop
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-700">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <Link to="/basket" className="hover:text-slate-900">MyBasket</Link>
            <Link to="/auth" className="hover:text-slate-900">Login / Register</Link>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 sm:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>
        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
            <Link to="/" className="block py-2 text-slate-700 hover:text-slate-900">Home</Link>
            <Link to="/basket" className="block py-2 text-slate-700 hover:text-slate-900">Basket</Link>
            <Link to="/auth" className="block py-2 text-slate-700 hover:text-slate-900">Login / Register</Link>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

export default Layout
