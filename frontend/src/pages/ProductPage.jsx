import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProduct, addToBasket } from '../lib/api'

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProduct(id)
      .then((data) => setProduct(data))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    const result = await addToBasket(id)
    setMessage(result.message)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return <div className="text-slate-500">Loading product...</div>
  }

  if (!product) {
    return <div className="text-slate-500">Product not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="rounded-[2rem] bg-slate-100 p-4">
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-200">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-72 items-center justify-center text-slate-400">No image available</div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
              <p className="mt-2 text-slate-600">{product.brand || 'Brand not specified'}</p>
            </div>
            <p className="text-slate-700">{product.description || 'No description provided.'}</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Price</p>
                <p className="text-4xl font-semibold text-slate-900">${product.price}</p>
              </div>
              <button
                onClick={handleAdd}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Add to Basket
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Type</p>
                <p>{product.product_type}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Quantity</p>
                <p>{product.quantity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {message ? (
        <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{message}</div>
      ) : null}
    </div>
  )
}

export default ProductPage
