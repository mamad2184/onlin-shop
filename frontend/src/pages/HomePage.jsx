import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../lib/api'
import RatingStars from '../components/RatingStars'
import Toast from '../components/Toast'

const categoryLabels = {
  all: 'All',
  shoe: 'Shoe',
  cloth: 'Cloth',
}

function HomePage() {
  const [message, setMessage] = useState('')
  const [toastTrigger, setToastTrigger] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['products', activeSearchQuery, category, page],
    queryFn: async () => {
      const data = await fetchProducts(activeSearchQuery, category, page)

      const nextProducts = Array.isArray(data) ? data : data?.results

      if (!Array.isArray(nextProducts)) {
        throw new Error('Invalid product list response.')
      }

      return {
        products: nextProducts,
        pagination: {
          count: Array.isArray(data) ? nextProducts.length : data.count || 0,
          next: Array.isArray(data) ? null : data.next,
          previous: Array.isArray(data) ? null : data.previous,
        },
      }
    },
  })

  const products = data?.products || []
  const pagination = data?.pagination || { count: 0, next: null, previous: null }

  const formatPrice = (value) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : 'No price'

  const notify = (nextMessage) => {
    setMessage(nextMessage)
    setToastTrigger((current) => current + 1)
  }

  useEffect(() => {
    if (error && !data) {
      notify(
        error.response?.data?.detail ||
          error.message ||
          'Unable to load products.',
      )
    }
  }, [error, data])

  const handleCategoryChange = (key) => {
    setCategory(key)
    setPage(1)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setActiveSearchQuery(searchQuery)
    setPage(1)
  }

  const handlePreviousPage = () => {
    if (pagination.previous && !loading) {
      setPage((current) => current - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.next && !loading) {
      setPage((current) => current + 1)
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-900/10 sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-slate-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Modern essentials
            </span>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find your next
              <span className="block text-slate-400">favorite piece.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore our collection of clothing and shoes, discover new styles,
              and find something made for you.
            </p>
          </div>

          <Link
            to="/basket"
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100 active:scale-[0.98]"
          >
            View Basket
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                  category === key
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSearch}
            className="flex w-full gap-2 lg:max-w-md"
          >
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-4-4" />
              </svg>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-700 active:scale-[0.98]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <Toast
        message={message}
        trigger={toastTrigger}
        onClose={() => setMessage('')}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Collection
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Showing {categoryLabels[category]} products
          </p>
        </div>

        {!loading && products.length > 0 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            {pagination.count} product{pagination.count === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-56 animate-pulse bg-slate-100" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                —
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                No products found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search term or choose a different category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const firstImage = (
                  Array.isArray(product.product_images)
                    ? product.product_images
                    : []
                ).find((imageUrl) => imageUrl)

                return (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="block"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                            No image
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                        {!product.is_available ? (
                          <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm backdrop-blur">
                            Unavailable
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    <div className="space-y-4 p-5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
                              {product.name}
                            </h2>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                              {product.product_type}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <RatingStars
                            value={product.average_rating}
                            count={product.ratings_count}
                          />
                        </div>
                      </div>

                      <div className="flex min-h-10 items-center justify-between gap-4">
                        {product.price && typeof product.price === 'object' ? (
                          <div className="flex flex-wrap items-baseline gap-2">
                            {product.price.discount_percentage > 0 ? (
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(product.price.original_price)}
                              </span>
                            ) : null}

                            <span className="text-xl font-bold tracking-tight text-slate-900">
                              {formatPrice(product.price.final_price)}
                            </span>

                            {product.price.discount_percentage > 0 ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                -{product.price.discount_percentage}%
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xl font-bold tracking-tight text-slate-900">
                            {formatPrice(product.price)}
                          </span>
                        )}

                        <Link
                          to={`/product/${product.id}`}
                          className="shrink-0 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
                        >
                          Details
                        </Link>
                      </div>

                      {product.is_available ? (
                        <Link
                          to={`/product/${product.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-700 active:scale-[0.98]"
                        >
                          Choose options
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </Link>
                      ) : (
                        <span className="block w-full rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-400">
                          Currently unavailable
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {(pagination.previous || pagination.next) ? (
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <button
                type="button"
                disabled={!pagination.previous || loading}
                onClick={handlePreviousPage}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-xs font-semibold text-slate-400 sm:text-sm">
                Page {page}
              </span>

              <button
                type="button"
                disabled={!pagination.next || loading}
                onClick={handleNextPage}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default HomePage