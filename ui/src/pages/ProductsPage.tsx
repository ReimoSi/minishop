import { useMemo, useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { apiDelete } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useProducts } from '../hooks/useProducts'

export default function ProductsPage() {
    const [q, setQ] = useState('')
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)
    const [sort, setSort] = useState<'id,asc' | 'id,desc'>('id,asc')

    const queryClient = useQueryClient()
    const { data, isLoading, isError, error } = useProducts({ q, page, size, sort })

    const delMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })

    function toggleSort() {
        setSort((prev) => (prev === 'id,asc' ? 'id,desc' : 'id,asc'))
    }

    const rows: ProductDto[] = useMemo(() => data?.content ?? [], [data])

    if (isLoading) return <p style={{ padding: 24 }}>Loading…</p>
    if (isError) return <p style={{ padding: 24, color: 'crimson' }}>Error: {(error as Error)?.message ?? 'unknown'}</p>

    return (
        <div style={{ padding: 24 }}>
            <h1>Products</h1>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <input
                    placeholder="Search…"
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value)
                        setPage(0)
                    }}
                />
                <button onClick={toggleSort}>
                    Sort by ID {sort === 'id,asc' ? '↑' : '↓'}
                </button>
                <label>
                    Page size:{' '}
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(Number(e.target.value))
                            setPage(0)
                        }}
                    >
                        {[5, 10, 20, 50].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
            </div>

            {!rows.length ? (
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
                    {rows.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.sku}</td>
                            <td>{p.name}</td>
                            <td>{p.priceCents}</td>
                            <td>{p.currencyCode}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        if (p.id && confirm(`Delete product #${p.id}?`)) {
                                            delMutation.mutate(p.id)
                                        }
                                    }}
                                    disabled={delMutation.isPending}
                                >
                                    {delMutation.isPending ? 'Deleting…' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setPage(0)} disabled={data?.first}>⏮ First</button>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={data?.first}>◀ Prev</button>
                <span>
          Page {(data?.number ?? 0) + 1} / {data?.totalPages ?? 1}
        </span>
                <button
                    onClick={() => setPage((p) => Math.min((data?.totalPages ?? 1) - 1, p + 1))}
                    disabled={data?.last}
                >
                    Next ▶
                </button>
                <button
                    onClick={() => data && setPage(data.totalPages - 1)}
                    disabled={data?.last}
                >
                    Last ⏭
                </button>
            </div>
        </div>
    )
}
