import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addComment, addToBasket, fetchProduct, fetchProductComments } from '../lib/api'

function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsPagination, setCommentsPagination] = useState({ count: 0, next: null, previous: null })
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const variants = Array.isArray(product?.variants) ? product.variants : []
  const availableSizes = Array.isArray(product?.sizes) ? product.sizes : []
  const availableColors = variants
    .filter((variant) => variant.size === selectedSize && variant.is_available)
    .map((variant) => variant.color)
    .filter((color, index, colors) => colors.indexOf(color) === index)

  const selectedVariant = variants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize &&
      variant.is_available,
  )

  useEffect(() => {
    fetchProduct(id)
      .then((data) => {
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid product response.')
        }
        setProduct(data)
      })
      .catch((error) => {
        setLoadError(error.response?.data?.detail || error.message || 'Unable to load this product.')
      })
      .finally(() => setLoading(false))

    loadComments(1)
  }, [id])

  const loadComments = (page = 1) => {
    setCommentsLoading(true)
    fetchProductComments(id, page)
      .then((data) => {
        const nextComments = Array.isArray(data) ? data : data?.results
        if (!Array.isArray(nextComments)) {
          throw new Error('Invalid comments response.')
        }
        setComments(nextComments)
        setCommentsPage(page)
        setCommentsPagination({
          count: Array.isArray(data) ? nextComments.length : data.count || 0,
          next: Array.isArray(data) ? null : data.next,
          previous: Array.isArray(data) ? null : data.previous,
        })
        setCommentsError('')
      })
      .catch((error) => {
        setCommentsError(error.response?.data?.detail || error.message || 'Unable to load comments.')
        setComments([])
      })
      .finally(() => setCommentsLoading(false))
  }

  const handleAdd = async () => {
    if (!selectedColor || !selectedSize) {
      setMessage('Please choose both a color and a size before adding to basket.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (!selectedVariant || selectedVariant.quantity <= 0) {
      setMessage('This variant is out of stock.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (quantity > selectedVariant.quantity) {
      setMessage(`Only ${selectedVariant.quantity} item${selectedVariant.quantity === 1 ? '' : 's'} available.`)
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const result = await addToBasket(id, {
        color: selectedColor,
        size: selectedSize,
        quantity,
      })
      setMessage(result.message)
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.detail || 'Unable to add this item to your basket.')
    }
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
      loadComments(1)
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
    return <div className="rounded-2xl bg-rose-50 p-4 text-rose-800">{loadError || 'Product not found.'}</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="rounded-[2rem] bg-slate-100 p-4">
            <div className="relative h-72 overflow-hidden rounded-[1.75rem] bg-slate-200 sm:h-[30rem]">
              {(() => {
                const images = (Array.isArray(product.product_images) ? product.product_images : []).filter((imageUrl) => imageUrl)
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
            <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size)
                        setSelectedColor('')
                      }}
                      className={`rounded-full border px-3 py-2 text-sm font-medium ${selectedSize === size ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Color{selectedSize ? ` for size ${selectedSize}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSize ? (
                    availableColors.length > 0 ? (
                      availableColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full border px-3 py-2 text-sm font-medium ${selectedColor === color ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                        >
                          {color}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No colors are available for this size.</p>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">Choose a size first.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Price</p>
                  <p className="text-4xl font-semibold text-slate-900">
                    {selectedVariant
                      ? `$${selectedVariant.price}`
                      : selectedSize
                        ? 'Please Select a Color'
                        : 'Please Select a Size'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Stock:{' '}
                    {selectedVariant
                      ? selectedVariant.quantity > 0
                        ? selectedVariant.quantity
                        : 'Out of stock'
                      : 'Select a color'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 rounded-lg border border-slate-200 p-2 text-center text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
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
                <p className="font-semibold text-slate-900">Variant stock</p>
                <p>
                  {selectedVariant
                    ? selectedVariant.quantity > 0
                      ? `${selectedVariant.quantity} available`
                      : 'Out of stock'
                    : 'Select size and color'}
                </p>
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
          {commentsLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading comments...</p>
          ) : commentsError ? (
            <p className="mt-4 text-sm text-rose-700">{commentsError}</p>
          ) : comments.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-100 p-4">
                  <p className="text-sm text-slate-700">{c.comment}</p>
                  <div className="mt-2 text-xs text-slate-500">By {c.user?.username || 'User'} • {new Date(c.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No comments yet.</p>
          )}
          {(commentsPagination.previous || commentsPagination.next) ? (
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={!commentsPagination.previous || commentsLoading}
                onClick={() => loadComments(commentsPage - 1)}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {commentsPage} · {commentsPagination.count} comments</span>
              <button
                type="button"
                disabled={!commentsPagination.next || commentsLoading}
                onClick={() => loadComments(commentsPage + 1)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ProductPage
