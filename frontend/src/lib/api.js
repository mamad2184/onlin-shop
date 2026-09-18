import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || (
  import.meta.env.DEV ? '/' : 'https://onlin-shop-production.up.railway.app/'
)
const token = localStorage.getItem('access_token')

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
    }
    return Promise.reject(error)
  },
)

export async function fetchProducts(search = '', category = 'all', page = 1) {
  let url = '/products/'
  const params = {}

  if (category && category !== 'all') {
    url = `/products/${category}/`
  }
  if (search) {
    params.search = search
  }
  if (page > 1) {
    params.page = page
  }

  const response = await api.get(url, { params })
  return response.data
}

export async function fetchProduct(id) {
  const response = await api.get(`/products/${id}/`)
  return response.data
}

export async function fetchProductComments(productId, page = 1) {
  const response = await api.get(`/products/${productId}/comments/`, {
    params: { page },
  })
  return response.data
}

export async function addComment(productId, comment) {
  const response = await api.post(`/products/${productId}/add-comment/`, { comment })
  return response.data
}

export async function fetchCommentReplies(commentId) {
  const response = await api.get(`/comments/${commentId}/replies/`)
  return response.data
}

export async function addCommentReply(commentId, text, parent = null) {
  const response = await api.post(`/comments/${commentId}/replies/`, { text, parent })
  return response.data
}

export async function rateProduct(productId, rating) {
  const response = await api.post(`/products/${productId}/rate/`, { rating })
  return response.data
}

export async function loginUser(username, password) {
  const response = await api.post('/get-token/', { username, password })
  return response.data
}

export async function registerUser(username, password) {
  const response = await api.post('/register/', { username, password })
  return response.data
}

export async function fetchBasket() {
  const response = await api.get('/mybasket-list/')
  return response.data
}

export async function addToBasket(productId, payload = {}) {
  const response = await api.post(`/products/${productId}/add-basket/`, payload)
  return response.data
}

export async function deleteFromBasket(productId, payload = {}) {
  const response = await api.post(`/products/${productId}/delete-basket/`, payload)
  return response.data
}

export function setTokens(accessToken) {
  localStorage.setItem('access_token', accessToken)
}

export function logout() {
  localStorage.removeItem('access_token')
}
