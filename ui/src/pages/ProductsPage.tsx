import { useProducts } from '../hooks/useProducts'

export default function ProductsPage() {
    const { data, isLoading, isError, error } = useProducts()

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
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
