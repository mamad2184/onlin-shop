import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import BasketPage from './pages/BasketPage'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/basket" element={<BasketPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Layout>
  )
}

export default App
