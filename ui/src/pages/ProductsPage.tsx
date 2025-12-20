import { useMemo, useState, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { apiDelete } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useProducts } from '../hooks/useProducts'
import { useSearchParams } from 'react-router-dom'
import { formatMoneyFromMinor } from '../lib/money'

export default function ProductsPage() {
    const [sp, setSp] = useSearchParams()

    // loe algväärtused URL-ist
    const [q, setQ] = useState(sp.get('q') ?? '')
    const [page, setPage] = useState<number>(Number(sp.get('page') ?? 0))
    const [size, setSize] = useState<number>(Number(sp.get('size') ?? 10))
    const [sortField, setSortField] = useState(sp.get('sortField') ?? 'id')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>((sp.get('sortDir') as 'asc' | 'desc') ?? 'asc')

    // hoia URL sünkroonis (debounce q’d minimaalselt)
    useEffect(() => {
        const t = setTimeout(() => {
            const next = new URLSearchParams(sp)
            if (q) next.set('q', q); else next.delete('q')
            next.set('page', String(page))
            next.set('size', String(size))
            next.set('sortField', sortField)
            next.set('sortDir', sortDir)
            setSp(next, { replace: true })
        }, 150)
        return () => clearTimeout(t)
    }, [q, page, size, sortField, sortDir])

    const sortParam = `${sortField},${sortDir}`

    const queryClient = useQueryClient()
    const { data, isLoading, isError, error } = useProducts({ q, page, size, sort: sortParam })

    const delMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })

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

                <label>
                    Sort:{' '}
                    <select
                        value={sortField}
                        onChange={(e) => {
                            setSortField(e.target.value)
                            setPage(0)
                        }}
                    >
                        <option value="price">price</option>
                        <option value="name">name</option>
                        <option value="sku">sku</option>
                        <option value="updated">updated</option>
                        <option value="created">created</option>
                        <option value="id">id</option>
                    </select>
                </label>

                <button
                    onClick={() => {
                        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                        setPage(0)
                    }}
                    title="Toggle direction"
                >
                    {sortDir === 'asc' ? '↑ asc' : '↓ desc'}
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
                        <th>Price</th>
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
                            <td>{formatMoneyFromMinor(p.priceCents, p.currencyCode, 'et-EE')}</td>
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
