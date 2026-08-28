import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/'
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

export async function fetchProducts(search = '', category = 'all') {
  let url = '/products/'
  const params = {}

  if (category && category !== 'all') {
    url = `/products/${category}/`
  }
  if (search) {
    params.search = search
  }

  const response = await api.get(url, { params })
  return response.data
}

export async function fetchProduct(id) {
  const response = await api.get(`/products/${id}/`)
  return response.data
}

export async function addComment(productId, comment) {
  const response = await api.post(`/products/${productId}/add-comment/`, { comment })
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

export async function addToBasket(productId) {
  const response = await api.post(`/products/${productId}/add-basket/`)
  return response.data
}

export async function deleteFromBasket(productId) {
  const response = await api.post(`/products/${productId}/delete-basket/`)
  return response.data
}

export function setTokens(accessToken) {
  localStorage.setItem('access_token', accessToken)
}

export function logout() {
  localStorage.removeItem('access_token')
}
