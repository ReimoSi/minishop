import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import ProductNewPage from './pages/ProductNewPage'
import ProductEditPage from "./pages/ProductEditPage";

export default function App() {
    return (
        <BrowserRouter>
            <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display:'flex', gap:12 }}>
                <Link to="/products">Products</Link>
                <Link to="/products/new">Add</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<ProductNewPage />} />
                <Route path="/products/:id/edit" element={<ProductEditPage />} />
            </Routes>
        </BrowserRouter>
    )
}

