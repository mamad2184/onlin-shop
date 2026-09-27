import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchBasket, deleteFromBasket } from '../lib/api'
import Toast from '../components/Toast'

function BasketPage() {
  const [message, setMessage] = useState('')
  const [toastTrigger, setToastTrigger] = useState(0)
  const [authRequired, setAuthRequired] = useState(false)
  const queryClient = useQueryClient()

  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  const {
    data: basketData,
    isLoading: loading,
    error: basketError,
  } = useQuery({
    queryKey: ['basket'],
    queryFn: fetchBasket,
    enabled: isAuthenticated,
  })

  const removeMutation = useMutation({
    mutationFn: ({ productId, color, size }) =>
      deleteFromBasket(productId, {
        color,
        size,
      }),
    onSuccess: async (result) => {
      notify(result.message)
      await queryClient.invalidateQueries({ queryKey: ['basket'] })
    },
    onError: (error) => {
      notify(
        error.response?.data?.message ||
          'Unable to remove item from basket.',
      )
    },
  })

  const items = Array.isArray(basketData?.items)
    ? basketData.items
    : []

  const basketSummary = {
    basket_total: basketData?.basket_total || 0,
    total_products: basketData?.total_products || 0,
    total_items: basketData?.total_items || 0,
  }

  const notify = (nextMessage, requiresAuth = false) => {
    setMessage(nextMessage)
    setAuthRequired(requiresAuth)
    setToastTrigger((current) => current + 1)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      notify(
        'Please log in or register to view your basket.',
        true,
      )
      return
    }

    if (basketError) {
      const status = basketError.response?.status
      const errorMessage =
        basketError.response?.data?.message ||
        basketError.response?.data?.detail

      notify(
        status === 401
          ? 'Your login session has expired. Please log in again.'
          : errorMessage || 'Unable to load your basket.',
        status === 401,
      )
    }
  }, [isAuthenticated, basketError])

  const formatPrice = (value) => {
    if (
      typeof value !== 'number' &&
      typeof value !== 'string'
    ) {
      return 'Unknown'
    }

    return `$${Number(value).toFixed(2)}`
  }

  const handleRemove = (item) => {
    const productId = item.product?.id || item.product

    if (!productId) {
      notify(
        'Unable to remove this item because product data is not available.',
      )
      return
    }

    removeMutation.mutate({
      productId,
      color: item.color,
      size: item.size,
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Your shopping bag
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Basket
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Review your selected items and manage your basket
            before continuing.
          </p>
        </div>

        {items.length > 0 ? (
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            Continue shopping
          </Link>
        ) : null}
      </div>

      <Toast
        message={message}
        trigger={toastTrigger}
        onClose={() => {
          setMessage('')
          setAuthRequired(false)
        }}
        action={
          authRequired ? (
            <Link
              to="/auth"
              className="shrink-0 font-semibold underline hover:text-amber-200"
            >
              Login or register
            </Link>
          ) : null
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[1.75rem] border border-slate-200 bg-white p-5"
              >
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-7 w-28 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-24 rounded bg-slate-100" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[1.75rem] border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-6 w-48 rounded bg-slate-200" />
                    <div className="h-4 w-40 rounded bg-slate-100" />
                  </div>

                  <div className="h-10 w-28 rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM19 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Your basket is empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Looks like you haven't added anything yet.
            Explore the collection and find something you
            like.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
          >
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="space-y-4">
            {items.map((item) => {
              const productId =
                item.product?.id || item.product

              const productName =
                item.product?.name ||
                `Product ${productId}`

              const hasDiscount =
                item.discount_percentage > 0 &&
                item.original_price > item.price

              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                >
                  <Link
                    to={`/product/${productId}`}
                    aria-label={`View ${productName}`}
                    className="absolute inset-0 z-0 rounded-[1.75rem]"
                  />

                  <div className="relative z-10 grid gap-5 p-5 pointer-events-none sm:grid-cols-[1fr_auto] sm:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                          Product
                        </span>

                        {hasDiscount ? (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700">
                            -{item.discount_percentage}%
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-3 truncate text-xl font-bold tracking-tight text-slate-950 transition group-hover:text-slate-700">
                        {productName}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          Color: {item.color || 'No color'}
                        </span>

                        <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          Size: {item.size || 'No size'}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {hasDiscount ? (
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(
                              item.original_price,
                            )}
                          </span>
                        ) : null}

                        <span
                          className={
                            hasDiscount
                              ? 'text-sm font-bold text-emerald-700'
                              : 'text-sm font-semibold text-slate-700'
                          }
                        >
                          {formatPrice(item.price)} / item
                        </span>
                      </div>
                    </div>

                    <div className="relative z-20 flex flex-col items-start gap-4 border-t border-slate-100 pt-5 pointer-events-auto sm:min-w-36 sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {item.quantity}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Line total
                        </p>

                        <p className="mt-1 text-xl font-black tracking-tight text-slate-950">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={removeMutation.isPending}
                        className="w-full rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {removeMutation.isPending
                          ? 'Removing...'
                          : 'Remove one'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
              <div className="bg-slate-950 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Order summary
                </p>

                <p className="mt-3 text-4xl font-black tracking-tight">
                  {formatPrice(
                    basketSummary.basket_total,
                  )}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Current basket total
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Products
                  </span>

                  <span className="font-bold text-slate-900">
                    {basketSummary.total_products}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Total items
                  </span>

                  <span className="font-bold text-slate-900">
                    {basketSummary.total_items}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">
                      Basket total
                    </span>

                    <span className="text-xl font-black text-slate-950">
                      {formatPrice(
                        basketSummary.basket_total,
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  to="/"
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default BasketPage