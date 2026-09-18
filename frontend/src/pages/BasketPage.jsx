import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBasket, deleteFromBasket } from '../lib/api'

function BasketPage() {
  const [items, setItems] = useState([])
  const [basketSummary, setBasketSummary] = useState({
    basket_total: 0,
    total_products: 0,
    total_items: 0,
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchBasket()
      .then((basketData) => {
        setItems(Array.isArray(basketData?.items) ? basketData.items : [])
        setBasketSummary({
          basket_total: basketData?.basket_total || 0,
          total_products: basketData?.total_products || 0,
          total_items: basketData?.total_items || 0,
        })
      })
      .catch((error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || error.response?.data?.detail
        setMessage(status === 401 ? 'Your login session has expired. Please log in again.' : message || 'Unable to load your basket.')
      })
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return 'Unknown'
    }
    return `$${Number(value).toFixed(2)}`
  }

  const handleRemove = async (item) => {
    const productId = item.product?.id || item.product
    if (!productId) {
      setMessage('Unable to remove this item because product data is not available.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const result = await deleteFromBasket(productId, {
        color: item.color,
        size: item.size,
      })
      setMessage(result.message)
      const refreshedBasket = await fetchBasket()
      setItems(Array.isArray(refreshedBasket?.items) ? refreshedBasket.items : [])
      setBasketSummary({
        basket_total: refreshedBasket?.basket_total || 0,
        total_products: refreshedBasket?.total_products || 0,
        total_items: refreshedBasket?.total_items || 0,
      })
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
                <p className="text-3xl font-semibold">{formatPrice(basketSummary.basket_total)}</p>
              </div>
              <p className="text-sm text-slate-600">
                {basketSummary.total_products} product{basketSummary.total_products === 1 ? '' : 's'} · {basketSummary.total_items} item{basketSummary.total_items === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {items.map((item) => {
              const productId = item.product?.id || item.product
              const productName = item.product?.name || `Product ${productId}`
              const hasDiscount = item.discount_percentage > 0 && item.original_price > item.price
              return (
                <div key={item.id} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md">
                  <Link
                    to={`/product/${productId}`}
                    aria-label={`View ${productName}`}
                    className="absolute inset-0 z-0 rounded-3xl"
                  />
                  <div className="relative z-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center pointer-events-none">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Product</p>
                      <p className="text-lg font-semibold text-slate-900">{productName}</p>
                      <p className="mt-2 text-sm text-slate-600">Variant: {item.color || 'No color'} / {item.size || 'No size'}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        {hasDiscount ? <span className="text-slate-400 line-through">{formatPrice(item.original_price)}</span> : null}
                        <span className={hasDiscount ? 'font-semibold text-emerald-700' : 'text-slate-600'}>
                          Unit price: {formatPrice(item.price)}
                        </span>
                        {hasDiscount ? <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">-{item.discount_percentage}%</span> : null}
                      </div>
                      <p className="text-sm text-slate-600">Line total: {formatPrice(item.total_price)}</p>
                    </div>
                    <div className="relative z-20 flex flex-col items-start gap-3 text-sm text-slate-600 sm:items-end pointer-events-auto">
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
