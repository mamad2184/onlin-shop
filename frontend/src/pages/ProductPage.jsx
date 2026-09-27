import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  addComment,
  addCommentReply,
  addToBasket,
  fetchCommentReplies,
  fetchProduct,
  fetchProductComments,
  rateProduct,
} from '../lib/api'
import RatingStars from '../components/RatingStars'
import Toast from '../components/Toast'

function ProductPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const {
    data: product,
    isLoading: loading,
    error: productError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await fetchProduct(id)

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid product response.')
      }

      return data
    },
  })

  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsPagination, setCommentsPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [toastTrigger, setToastTrigger] = useState(0)
  const [authPrompt, setAuthPrompt] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [replies, setReplies] = useState({})
  const [replyTarget, setReplyTarget] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyPosting, setReplyPosting] = useState(false)
  const [ratingPosting, setRatingPosting] = useState(false)
  const [adding, setAdding] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [timeLeft, setTimeLeft] = useState('')

  const variants = Array.isArray(product?.variants) ? product.variants : []
  const availableSizes = Array.isArray(product?.sizes) ? product.sizes : []

  const availableColors = variants
    .filter(
      (variant) =>
        variant.size === selectedSize &&
        variant.is_available,
    )
    .map((variant) => variant.color)
    .filter(
      (color, index, colors) =>
        colors.indexOf(color) === index,
    )

  const selectedVariant = variants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize &&
      variant.is_available,
  )

  const images = (
    Array.isArray(product?.product_images)
      ? product.product_images
      : []
  ).filter(Boolean)

  const currentImage =
    images.length > 0
      ? images[imageIndex % images.length]
      : null

  const formatPrice = (value) =>
    typeof value === 'number'
      ? `$${value.toFixed(2)}`
      : 'Price unavailable'

  const notify = (nextMessage, requiresAuth = false) => {
    setMessage(nextMessage)
    setAuthPrompt(requiresAuth)
    setToastTrigger((current) => current + 1)
  }

  const requireAuth = (action) => {
    notify(`Please log in or register to ${action}.`, true)
    return false
  }

  useEffect(() => {
    if (!product?.is_discount_active || !product.discount_end) {
      setTimeLeft('')
      return undefined
    }

    const updateTimeLeft = () => {
      const remaining =
        new Date(product.discount_end).getTime() - Date.now()

      if (remaining <= 0) {
        setTimeLeft('Discount ended')
        return false
      }

      const totalSeconds = Math.floor(remaining / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor(
        (totalSeconds % 86400) / 3600,
      )
      const minutes = Math.floor(
        (totalSeconds % 3600) / 60,
      )
      const seconds = totalSeconds % 60

      setTimeLeft(
        `${days}d ${String(hours).padStart(2, '0')}h ${String(
          minutes,
        ).padStart(2, '0')}m ${String(seconds).padStart(
          2,
          '0',
        )}s`,
      )

      return true
    }

    updateTimeLeft()

    const timer = window.setInterval(() => {
      if (!updateTimeLeft()) {
        window.clearInterval(timer)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [product?.is_discount_active, product?.discount_end])

  useEffect(() => {
    loadComments(1)
  }, [id])

  const loadComments = (page = 1) => {
    setCommentsLoading(true)

    fetchProductComments(id, page)
      .then((data) => {
        const nextComments = Array.isArray(data)
          ? data
          : data?.results

        if (!Array.isArray(nextComments)) {
          throw new Error('Invalid comments response.')
        }

        setComments(nextComments)
        setCommentsPage(page)

        setCommentsPagination({
          count: Array.isArray(data)
            ? nextComments.length
            : data.count || 0,
          next: Array.isArray(data) ? null : data.next,
          previous: Array.isArray(data)
            ? null
            : data.previous,
        })

        Promise.all(
          nextComments.map((comment) =>
            fetchCommentReplies(comment.id),
          ),
        )
          .then((replyLists) => {
            setReplies(
              Object.fromEntries(
                nextComments.map((comment, index) => [
                  comment.id,
                  replyLists[index],
                ]),
              ),
            )
          })
          .catch(() => setReplies({}))

        setCommentsError('')
      })
      .catch((error) => {
        setCommentsError(
          error.response?.data?.detail ||
            error.message ||
            'Unable to load comments.',
        )
        setComments([])
      })
      .finally(() => setCommentsLoading(false))
  }

  const handleReplySubmit = async (
    event,
    commentId,
    parentId = null,
  ) => {
    event.preventDefault()

    if (!replyText.trim()) return

    if (!localStorage.getItem('access_token')) {
      requireAuth('reply to comments')
      return
    }

    setReplyPosting(true)

    try {
      await addCommentReply(
        commentId,
        replyText.trim(),
        parentId,
      )

      const updatedReplies =
        await fetchCommentReplies(commentId)

      setReplies((current) => ({
        ...current,
        [commentId]: updatedReplies,
      }))

      setReplyText('')
      setReplyTarget(null)
      notify('Reply added')
    } catch (error) {
      notify(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Unable to add reply.',
      )
    } finally {
      setReplyPosting(false)
    }
  }

  const handleAdd = async () => {
    if (adding) return

    if (!localStorage.getItem('access_token')) {
      requireAuth('add items to your basket')
      return
    }

    if (!selectedColor || !selectedSize) {
      notify(
        'Please choose both a color and a size before adding to basket.',
      )
      return
    }

    if (!selectedVariant || selectedVariant.quantity <= 0) {
      notify('This variant is out of stock.')
      return
    }

    if (quantity > selectedVariant.quantity) {
      notify(
        `Only ${selectedVariant.quantity} item${
          selectedVariant.quantity === 1 ? '' : 's'
        } available.`,
      )
      return
    }

    setAdding(true)

    try {
      const result = await addToBasket(id, {
        color: selectedColor,
        size: selectedSize,
        quantity,
      })

      notify(result.message)
    } catch (error) {
      notify(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          'Unable to add this item to your basket.',
      )
    } finally {
      setAdding(false)
    }
  }

  const handleRatingChange = async (rating) => {
    if (!localStorage.getItem('access_token')) {
      requireAuth('rate products')
      return
    }

    setRatingPosting(true)

    try {
      const result = await rateProduct(id, rating)

      queryClient.setQueryData(['product', id], (current) => ({
        ...current,
        average_rating: result.average_rating,
        ratings_count: result.ratings_count,
        rating_breakdown: result.rating_breakdown,
        user_rating: rating,
      }))

      notify('Rating saved')
    } catch (error) {
      if (error.response?.status === 401) {
        requireAuth('rate products')
      } else {
        notify(
          error.response?.data?.detail ||
            'Unable to save your rating.',
        )
      }
    } finally {
      setRatingPosting(false)
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()

    if (!newComment.trim()) return

    if (!localStorage.getItem('access_token')) {
      requireAuth('add comments')
      return
    }

    setPosting(true)

    try {
      const response = await addComment(
        id,
        newComment.trim(),
      )

      notify(response.message || 'Comment added')
      setNewComment('')
      loadComments(1)
      setAuthPrompt(false)
    } catch (error) {
      notify(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Unable to add comment.',
      )
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-[28rem] rounded-[1.75rem] bg-slate-200 sm:h-[38rem]" />

            <div className="space-y-5">
              <div className="h-5 w-24 rounded-full bg-slate-200" />
              <div className="h-12 w-3/4 rounded-xl bg-slate-200" />
              <div className="h-5 w-1/2 rounded-lg bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-3xl bg-slate-100" />
              <div className="h-14 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="h-48 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
      </div>
    )
  }

  if (productError || !product) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">
          Product unavailable
        </p>
        <p className="mt-2">
          {productError?.response?.data?.detail ||
            productError?.message ||
            'Product not found.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Product */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* Gallery */}
          <div className="bg-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-sm">
              <div className="aspect-[4/5] min-h-[28rem] sm:min-h-[36rem]">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    decoding="async"
                    fetchPriority="high"
                    className="h-full w-full object-cover transition duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          (current - 1 + images.length) %
                          images.length,
                      )
                    }
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-2xl text-slate-800 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          (current + 1) % images.length,
                      )
                    }
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-2xl text-slate-800 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-slate-950/30 px-3 py-2 backdrop-blur">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setImageIndex(index)}
                        aria-label={`Go to image ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          index === imageIndex
                            ? 'w-7 bg-white'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-2xl border-2 bg-white transition ${
                      index === imageIndex
                        ? 'border-slate-900 shadow-md'
                        : 'border-transparent opacity-70 hover:border-slate-300 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Product information */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {product.product_type ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                  {product.product_type}
                </span>
              ) : null}

              {product.is_discount_active &&
              product.discount_percentage > 0 ? (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                  -{product.discount_percentage}%
                </span>
              ) : null}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {product.brand || 'Independent brand'}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {product.description ||
                  'No description provided.'}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-5 border-y border-slate-100 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Rating
                </p>
                <div className="mt-2">
                  <RatingStars
                    value={product.average_rating}
                    count={product.ratings_count}
                  />
                </div>
              </div>

              <div className="h-auto w-px bg-slate-200" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Your rating
                </p>
                <div
                  className={`mt-2 ${
                    ratingPosting
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                >
                  <RatingStars
                    value={product.user_rating}
                    interactive
                    onChange={handleRatingChange}
                  />
                </div>
              </div>
            </div>

            {/* Variant selector */}
            <div className="mt-7 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                    Size
                  </p>

                  {selectedSize ? (
                    <span className="text-xs font-medium text-slate-400">
                      Selected: {selectedSize}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSizes.length > 0 ? (
                    availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size)
                          setSelectedColor('')
                        }}
                        className={`min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                          selectedSize === size
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No sizes available.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                    Color
                  </p>

                  {selectedColor ? (
                    <span className="text-xs font-medium text-slate-400">
                      Selected: {selectedColor}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSize
                    ? `Available colors for ${selectedSize}`
                    : 'Choose a size first'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSize ? (
                    availableColors.length > 0 ? (
                      availableColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setSelectedColor(color)
                          }
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                            selectedColor === color
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {color}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No colors are available for this size.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      Choose a size first.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Price
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                {selectedVariant ? (
                  <>
                    {product.is_discount_active &&
                    selectedVariant.final_price <
                      selectedVariant.price ? (
                      <span className="text-lg font-medium text-slate-400 line-through">
                        {formatPrice(selectedVariant.price)}
                      </span>
                    ) : null}

                    <span
                      className={`text-4xl font-black tracking-tight ${
                        product.is_discount_active
                          ? 'text-emerald-700'
                          : 'text-slate-950'
                      }`}
                    >
                      {formatPrice(
                        selectedVariant.final_price ??
                          selectedVariant.price,
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-semibold text-slate-400">
                    {selectedSize
                      ? 'Select a color'
                      : 'Select a size'}
                  </span>
                )}
              </div>

              {product.is_discount_active &&
              product.discount_percentage > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                    Save {product.discount_percentage}%
                  </span>

                  {timeLeft ? (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      Ends in {timeLeft}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <p className="mt-3 text-sm text-slate-500">
                Stock:{' '}
                <span className="font-semibold text-slate-700">
                  {selectedVariant
                    ? selectedVariant.quantity > 0
                      ? `${selectedVariant.quantity} available`
                      : 'Out of stock'
                    : 'Select a color'}
                </span>
              </p>
            </div>

            {/* Quantity + basket */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5 sm:w-36">
                <label
                  htmlFor="product-quantity"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
                >
                  Qty
                </label>

                <input
                  id="product-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Number(event.target.value) || 1,
                      ),
                    )
                  }
                  className="w-14 bg-transparent text-center text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {adding ? 'Adding...' : 'Add to Basket'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Type
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {product.product_type || 'Not specified'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Variant stock
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
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
      </section>

      <Toast
        message={message}
        trigger={toastTrigger}
        onClose={() => {
          setMessage('')
          setAuthPrompt(false)
        }}
        action={
          authPrompt ? (
            <Link
              to="/auth"
              className="shrink-0 font-semibold underline hover:text-amber-200"
            >
              Login or register
            </Link>
          ) : null
        }
      />

      {/* Comments */}
      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        {/* Add comment */}
        <div className="h-fit rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7 lg:sticky lg:top-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Community
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Share your thoughts
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tell other shoppers what you think about this
              product.
            </p>
          </div>

          <form
            onSubmit={handleCommentSubmit}
            className="mt-6"
          >
            <textarea
              value={newComment}
              onChange={(event) =>
                setNewComment(event.target.value)
              }
              placeholder="Write your comment..."
              className="min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              rows={5}
            />

            <button
              type="submit"
              disabled={posting}
              className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>

        {/* Comment list */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Customer feedback
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Comments
              </h2>
            </div>

            {!commentsLoading &&
            !commentsError &&
            comments.length > 0 ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {commentsPagination.count} total
              </span>
            ) : null}
          </div>

          {commentsLoading ? (
            <div className="space-y-4 pt-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl bg-slate-50 p-5"
                >
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
                  <div className="mt-4 h-3 w-20 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : commentsError ? (
            <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">
              {commentsError}
            </div>
          ) : comments.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {comment.user?.username || 'User'}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          comment.created_at,
                        ).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyTarget({
                          commentId: comment.id,
                          parentId: null,
                          label:
                            comment.user?.username ||
                            'this comment',
                        })
                      }
                      className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
                    >
                      Reply
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {comment.comment}
                  </p>

                  {Array.isArray(replies[comment.id]) &&
                  replies[comment.id].length > 0 ? (
                    <div className="mt-5 space-y-3 border-l-2 border-slate-200 pl-4">
                      {replies[comment.id].map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {reply.user?.username ||
                                  'User'}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {new Date(
                                  reply.created_at,
                                ).toLocaleString()}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setReplyTarget({
                                  commentId: comment.id,
                                  parentId: reply.id,
                                  label:
                                    reply.user?.username ||
                                    'this reply',
                                })
                              }
                              className="text-xs font-semibold text-slate-500 transition hover:text-slate-950"
                            >
                              Reply
                            </button>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {replyTarget?.commentId ===
                  comment.id ? (
                    <form
                      onSubmit={(event) =>
                        handleReplySubmit(
                          event,
                          comment.id,
                          replyTarget.parentId,
                        )
                      }
                      className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-500">
                          Replying to {replyTarget.label}
                        </p>
                      </div>

                      <textarea
                        value={replyText}
                        onChange={(event) =>
                          setReplyText(event.target.value)
                        }
                        placeholder="Write your reply..."
                        className="mt-3 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                        rows={3}
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={replyPosting}
                          className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {replyPosting
                            ? 'Posting...'
                            : 'Post Reply'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplyTarget(null)
                            setReplyText('')
                          }}
                          className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No comments yet.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Be the first person to share your thoughts.
              </p>
            </div>
          )}

          {(commentsPagination.previous ||
            commentsPagination.next) ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={
                  !commentsPagination.previous ||
                  commentsLoading
                }
                onClick={() =>
                  loadComments(commentsPage - 1)
                }
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-center text-xs font-semibold text-slate-400">
                Page {commentsPage} ·{' '}
                {commentsPagination.count} comments
              </span>

              <button
                type="button"
                disabled={
                  !commentsPagination.next ||
                  commentsLoading
                }
                onClick={() =>
                  loadComments(commentsPage + 1)
                }
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default ProductPage