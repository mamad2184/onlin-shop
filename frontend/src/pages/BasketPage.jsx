import { useEffect, useState } from 'react'
import { fetchBasket, deleteFromBasket, fetchProducts } from '../lib/api'

function BasketPage() {
  const [items, setItems] = useState([])
  const [productsById, setProductsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([fetchBasket(), fetchProducts()])
      .then(([basketData, productData]) => {
        setItems(basketData)
        setProductsById(Object.fromEntries(productData.map((item) => [item.id, item])))
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Unable to load basket. Log in to continue.')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  const getProduct = (item) => {
    if (item.product && typeof item.product === 'object') {
      return item.product
    }
    if (item.product) {
      return productsById[item.product] || { id: item.product, name: `Product ${item.product}` }
    }
    return { id: item.id, name: 'Basket item', price: 'Unknown' }
  }

  const formatPrice = (value) => {
    if (typeof value !== 'number') {
      return 'Unknown'
    }
    return `$${value.toFixed(2)}`
  }

  const getItemTotal = (item) => {
    const product = getProduct(item)
    return typeof product.price === 'number' ? item.quantity * product.price : null
  }

  const basketTotal = items.reduce((total, item) => {
    const itemTotal = getItemTotal(item)
    return total + (itemTotal || 0)
  }, 0)

  const handleRemove = async (item) => {
    const productId = item.product && typeof item.product === 'object' ? item.product.id : item.product
    if (!productId) {
      setMessage('Unable to remove this item because product data is not available.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const result = await deleteFromBasket(productId)
      setMessage(result.message)
      setItems((prev) =>
        prev
          .map((current) =>
            current.id === item.id
              ? { ...current, quantity: Math.max(current.quantity - 1, 0) }
              : current,
          )
          .filter((current) => current.quantity > 0),
      )
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to remove item from basket.')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Basket</h1>
          <p className="text-slate-600">See what you added to your basket.</p>
        </div>
      </div>
      {message ? (
        <div className="mb-6 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">{message}</div>
      ) : null}
      {loading ? (
        <div className="text-slate-500">Loading basket...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          Your basket is empty. Add some products from the home page.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Basket total</p>
                <p className="text-3xl font-semibold">{formatPrice(basketTotal)}</p>
              </div>
              <p className="text-sm text-slate-600">Total for {items.length} item{items.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="space-y-4">
            {items.map((item) => {
              const product = getProduct(item)
              const itemTotal = getItemTotal(item)
              return (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Product</p>
                      <p className="text-lg font-semibold text-slate-900">{product.name || `Product ${product.id}`}</p>
                      <p className="mt-2 text-sm text-slate-600">Unit price: {formatPrice(product.price)}</p>
                      <p className="text-sm text-slate-600">Line total: {itemTotal !== null ? formatPrice(itemTotal) : 'Unknown'}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 text-sm text-slate-600 sm:items-end">
                      <span>Quantity: {item.quantity}</span>
                      <button
                        onClick={() => handleRemove(item)}
                        className="rounded-2xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
                      >
                        Remove one
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default BasketPage
