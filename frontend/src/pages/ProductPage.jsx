import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProduct, addToBasket } from '../lib/api'
import { addComment } from '../lib/api'

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setPosting(true)
    try {
      const res = await addComment(id, newComment.trim())
      setMessage(res.message || 'Comment added')
      setNewComment('')
      // refresh product to get latest comments
      const refreshed = await fetchProduct(id)
      setProduct(refreshed)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to add comment.')
    } finally {
      setPosting(false)
      setTimeout(() => setMessage(''), 3000)
    }
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
            <div className="relative h-72 overflow-hidden rounded-[1.75rem] bg-slate-200 sm:h-[30rem]">
              {(() => {
                const images = (product.product_images || []).filter((imageUrl) => imageUrl)
                if (images.length === 0) {
                  return <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                }
                const current = images[imageIndex % images.length]
                return (
                  <>
                    <img src={current} alt={product.name} className="h-full w-full object-cover" />
                    <button
                      onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImageIndex(idx)}
                          className={`h-2 w-6 rounded-full ${idx === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )
              })()}
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
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
          {product?.comments && product.comments.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {product.comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-100 p-4">
                  <p className="text-sm text-slate-700">{c.comment}</p>
                  <div className="mt-2 text-xs text-slate-500">By {c.user?.username || 'User'} • {new Date(c.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No comments yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Add a comment</h3>
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900"
              rows={4}
            />
            <div className="mt-3">
              <button
                type="submit"
                disabled={posting}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                {posting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
