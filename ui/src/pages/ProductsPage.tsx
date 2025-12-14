// ui/src/pages/ProductsPage.tsx
import { useProducts } from '../hooks/useProducts'
import { apiDelete } from '../lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function ProductsPage() {
    const qc = useQueryClient()
    const { data, isLoading, isError, error } = useProducts()

    async function handleDelete(id?: number) {
        if (!id) return
        if (!confirm(`Delete product #${id}?`)) return
        try {
            await apiDelete(`/api/products/${id}`)
            await qc.invalidateQueries({ queryKey: ['products'] })
        } catch (e: any) {
            alert(e?.message ?? 'Delete failed')
        }
    }

    if (isLoading) return <p>Loading…</p>
    if (isError) return <p>Error: {(error as Error)?.message ?? 'unknown'}</p>

    return (
        <div style={{ padding: 24 }}>
            <h1>Products</h1>
            {!data?.length ? (
                <p>No products yet.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Price (cents)</th>
                        <th>Currency</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.sku}</td>
                            <td>{p.name}</td>
                            <td>{p.priceCents}</td>
                            <td>{p.currencyCode}</td>
                            <td>
                                <button onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
