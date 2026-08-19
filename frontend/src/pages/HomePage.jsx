import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, addToBasket } from '../lib/api'

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
  const token = localStorage.getItem('access_token')

  const loadProducts = (search = '', selectedCategory = 'all') => {
    setLoading(true)
    fetchProducts(search, selectedCategory)
      .then((data) => setProducts(data))
      .catch((error) => {
        setMessage(error.response?.data?.detail || error.message || 'Unable to load products.')
        setProducts([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAdd = async (productId) => {
    if (!token) {
      setMessage('Log in first to add products to your basket.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const result = await addToBasket(productId)
      setMessage(result.message)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to add item to basket.')
    }
    setTimeout(() => setMessage(''), 3000)
  }

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
              loadProducts(searchQuery, key)
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
          loadProducts(searchQuery, category)
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const firstImage = (product.product_images || []).find((imageUrl) => imageUrl)

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
                    <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                    <p className="text-sm text-slate-500">{product.product_type}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-slate-900">${product.price}</span>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      Details
                    </Link>
                  </div>
                  <button
                    onClick={() => handleAdd(product.id)}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HomePage
