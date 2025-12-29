import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import ProductNewPage from './pages/ProductNewPage'

export default function App() {
    return (
        <BrowserRouter>
            <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
                <Link to="/products">Products</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<ProductNewPage />} />
            </Routes>
        </BrowserRouter>
    )
}

