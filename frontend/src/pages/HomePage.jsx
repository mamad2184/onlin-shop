import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../lib/api'

const categoryLabels = {
  all: 'All',
  shoe: 'Shoe',
  cloth: 'Cloth',
}

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })

  const formatPrice = (value) => (typeof value === 'number' ? `$${value.toFixed(2)}` : 'No price')

  const loadProducts = (search = '', selectedCategory = 'all', selectedPage = 1) => {
    setLoading(true)
    fetchProducts(search, selectedCategory, selectedPage)
      .then((data) => {
        const nextProducts = Array.isArray(data) ? data : data?.results
        if (!Array.isArray(nextProducts)) {
          throw new Error('Invalid product list response.')
        }
        setProducts(nextProducts)
        setPage(selectedPage)
        setPagination({
          count: Array.isArray(data) ? nextProducts.length : data.count || 0,
          next: Array.isArray(data) ? null : data.next,
          previous: Array.isArray(data) ? null : data.previous,
        })
        setMessage('')
      })
      .catch((error) => {
        setMessage(error.response?.data?.detail || error.message || 'Unable to load products.')
        setProducts([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-600">Browse the API-powered product catalog.</p>
        </div>
        <Link
          to="/basket"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View Basket
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setCategory(key)
              loadProducts(searchQuery, key, 1)
            }}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              category === key
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          loadProducts(searchQuery, category, 1)
        }}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search products"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none sm:max-w-md"
        />
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {message ? (
        <div className="mt-6 rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{message}</div>
      ) : null}
      <div className="mt-2 text-sm text-slate-500">Showing: {categoryLabels[category]} products</div>

      {loading ? (
        <div className="mt-8 text-slate-500">Loading products...</div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
              No products found.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
            const firstImage = (Array.isArray(product.product_images) ? product.product_images : [])
              .find((imageUrl) => imageUrl)

            return (
              <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 h-48 overflow-hidden rounded-3xl bg-slate-100">
                  {firstImage ? (
                    <img src={firstImage} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                      {!product.is_available ? (
                        <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                          Unavailable
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-500">{product.product_type}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    {product.price && typeof product.price === 'object' ? (
                      <div className="flex items-baseline gap-2">
                        {product.price.discount_percentage > 0 ? (
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(product.price.original_price)}
                          </span>
                        ) : null}
                        <span className="text-lg font-semibold text-emerald-700">
                          {formatPrice(product.price.final_price)}
                        </span>
                        {product.price.discount_percentage > 0 ? (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                            -{product.price.discount_percentage}%
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-slate-900">{formatPrice(product.price)}</span>
                    )}
                    <Link
                      to={`/product/${product.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      Details
                    </Link>
                  </div>
                    {product.is_available ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="block w-full rounded-2xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
                      >
                        Choose options
                      </Link>
                    ) : (
                      <span className="block w-full rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-400">
                        Unavailable
                      </span>
                    )}
                </div>
              </div>
            )
              })}
            </div>
          )}
          {(pagination.previous || pagination.next) ? (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={!pagination.previous || loading}
                onClick={() => loadProducts(searchQuery, category, page - 1)}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} · {pagination.count} products</span>
              <button
                type="button"
                disabled={!pagination.next || loading}
                onClick={() => loadProducts(searchQuery, category, page + 1)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default HomePage
