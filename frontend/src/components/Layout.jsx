import { Link } from 'react-router-dom'
import { useState } from 'react'

function Layout({ children }) {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black tracking-tight text-white shadow-lg shadow-slate-900/15 transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
              C&S
            </span>

            <span className="leading-none">
              <span className="block text-lg font-bold tracking-tight text-slate-950">
                cloth&shoe
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                modern essentials
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1 sm:flex">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              Home
            </Link>

            <Link
              to="/basket"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              My Basket
            </Link>

            <Link
              to="/auth"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-700 hover:shadow-md active:scale-[0.98]"
            >
              Login / Register
            </Link>
          </nav>

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {open ? (
          <div className="border-t border-slate-200/80 bg-white px-4 py-4 sm:hidden">
            <nav className="mx-auto max-w-7xl space-y-2">
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Home
              </Link>

              <Link
                to="/basket"
                onClick={closeMenu}
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                My Basket
              </Link>

              <Link
                to="/auth"
                onClick={closeMenu}
                className="flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
              >
                Login / Register
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  )
}

export default Layout