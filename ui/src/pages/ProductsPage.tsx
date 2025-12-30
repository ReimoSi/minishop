import { useMemo, useState, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { apiDelete } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useProducts } from '../hooks/useProducts'
import { useSearchParams, Link } from 'react-router-dom'
import { formatMoneyFromMinor } from '../lib/money'
import { useToast } from '../components/ToastProvider'

type Dir = 'asc' | 'desc'

function SortArrow({ dir }: { dir: Dir }) {
    return <span style={{ marginLeft: 4, opacity: 0.8 }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function ProductsPage() {
    const [sp, setSp] = useSearchParams()
    const [q, setQ] = useState(sp.get('q') ?? '')
    const [page, setPage] = useState<number>(Number(sp.get('page') ?? 0))
    const [size, setSize] = useState<number>(Number(sp.get('size') ?? 10))
    const [sortField, setSortField] = useState(sp.get('sortField') ?? 'id')
    const [sortDir, setSortDir] = useState<Dir>((sp.get('sortDir') as Dir) ?? 'asc')

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, page, size, sortField, sortDir])

    const sortParam = `${sortField},${sortDir}`
    const params = { q, page, size, sort: sortParam }

    const queryClient = useQueryClient()
    const { show } = useToast()
    const { data, isLoading, isError, error } = useProducts(params)

    // Optimistlik kustutamine
    const delMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiDelete(`/products/${id}`)
            return id
        },
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: ['products', params] })
            const prev = queryClient.getQueryData<any>(['products', params])
            if (prev?.content) {
                const next = { ...prev, content: prev.content.filter((p: any) => p.id !== id) }
                queryClient.setQueryData(['products', params], next)
            }
            return { prev }
        },
        onError: (err, _id, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(['products', params], ctx.prev)
            show((err as any)?.message ?? 'Delete failed', 'error')
        },
        onSuccess: () => {
            show('Product deleted', 'success')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })

    const rows: ProductDto[] = useMemo(() => data?.content ?? [], [data])

    function toggleHeaderSort(field: string) {
        if (sortField === field) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            // uue veeru default – enamikul ASC; hinnal võib vabalt ka DESC eelistada, aga jätame ASC
            setSortField(field)
            setSortDir('asc')
        }
        setPage(0)
    }

    function HeaderBtn({ field, children }: { field: string; children: React.ReactNode }) {
        const active = sortField === field
        return (
            <button
                type="button"
                onClick={() => toggleHeaderSort(field)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                }}
                aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                title={`Sort by ${field}`}
            >
                {children}
                {active && <SortArrow dir={sortDir} />}
            </button>
        )
    }

    if (isLoading) return <p style={{ padding: 24 }}>Loading…</p>
    if (isError) return <p style={{ padding: 24, color: 'crimson' }}>Error: {(error as Error)?.message ?? 'unknown'}</p>

    return (
        <div className="container">
            <h1>Products</h1>

            <div className="toolbar">
                <div className="filters">
                    <input
                        placeholder="Search…"
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(0) }}
                    />

                    {/* Võid selle rippmenüü varsti eemaldada, kui päise-sort meeldib */}
                    <label>
                        Sort:{' '}
                        <select
                            value={sortField}
                            onChange={(e) => { setSortField(e.target.value); setPage(0) }}
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
                        onClick={() => { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); setPage(0) }}
                        title="Toggle direction"
                    >
                        {sortDir === 'asc' ? '↑ asc' : '↓ desc'}
                    </button>

                    <label>
                        Page size:{' '}
                        <select
                            value={size}
                            onChange={(e) => { setSize(Number(e.target.value)); setPage(0) }}
                        >
                            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                </div>

                <div className="actions">
                    <Link className="btn" to="/products/new">Add product</Link>
                </div>
            </div>

            {!rows.length ? (
                <p>No products yet.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th><HeaderBtn field="id">ID</HeaderBtn></th>
                        <th><HeaderBtn field="sku">SKU</HeaderBtn></th>
                        <th><HeaderBtn field="name">Name</HeaderBtn></th>
                        <th><HeaderBtn field="price">Price</HeaderBtn></th>
                        <th><HeaderBtn field="currency">Currency</HeaderBtn></th>
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
                                <Link className="btn" to={`/products/${p.id}/edit`} style={{ marginRight: 6 }}>Edit</Link>
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
                <span>Page {(data?.number ?? 0) + 1} / {data?.totalPages ?? 1}</span>
                <button onClick={() => setPage((p) => Math.min((data?.totalPages ?? 1) - 1, p + 1))} disabled={data?.last}>Next ▶</button>
                <button onClick={() => data && setPage(data.totalPages - 1)} disabled={data?.last}>Last ⏭</button>
            </div>
        </div>
    )
}
