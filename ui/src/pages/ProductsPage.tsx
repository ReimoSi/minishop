import { useMemo, useState, useEffect, MouseEvent } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { apiDelete } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useProducts } from '../hooks/useProducts'
import { useSearchParams, Link } from 'react-router-dom'
import { formatMoneyFromMinor } from '../lib/money'
import ColumnPicker, { DEFAULT_PRODUCT_COLUMNS, ProductColumns } from '../components/ColumnPicker'

type Dir = 'asc' | 'desc'
type SortLevel = { field: string; dir: Dir }

function SortArrow({ dir }: { dir: Dir }) {
    return <span style={{ marginLeft: 4, opacity: 0.8 }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

// 'id,asc|name,desc'  <->  [{field:'id',dir:'asc'},{field:'name',dir:'desc'}]
function parseSortParam(raw: string | null | undefined): SortLevel[] {
    if (!raw) return [{ field: 'id', dir: 'asc' }]
    const parts = raw.split('|').map(s => s.trim()).filter(Boolean)
    const levels: SortLevel[] = []
    for (const p of parts) {
        const [f, d] = p.split(',')
        if (!f) continue
        const dir = (d === 'desc' ? 'desc' : 'asc') as Dir
        levels.push({ field: f, dir })
    }
    return levels.length ? levels : [{ field: 'id', dir: 'asc' }]
}
function stringifySort(levels: SortLevel[]): string {
    return levels.map(l => `${l.field},${l.dir}`).join('|')
}

const COLS_STORAGE_KEY = 'products.cols.v1'

export default function ProductsPage() {
    const [sp, setSp] = useSearchParams()
    const [q, setQ] = useState(sp.get('q') ?? '')
    const [page, setPage] = useState<number>(Number(sp.get('page') ?? 0))
    const [size, setSize] = useState<number>(Number(sp.get('size') ?? 10))
    const [sorts, setSorts] = useState<SortLevel[]>(() => parseSortParam(sp.get('sort')))

    // Veergude nähtavus (localStorage)
    const [cols, setCols] = useState<ProductColumns>(() => {
        try {
            const raw = localStorage.getItem(COLS_STORAGE_KEY)
            if (raw) return { ...DEFAULT_PRODUCT_COLUMNS, ...JSON.parse(raw) }
        } catch {}
        return DEFAULT_PRODUCT_COLUMNS
    })
    useEffect(() => {
        try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(cols)) } catch {}
    }, [cols])

    // URL sünk
    useEffect(() => {
        const t = setTimeout(() => {
            const next = new URLSearchParams(sp)
            if (q) next.set('q', q); else next.delete('q')
            next.set('page', String(page))
            next.set('size', String(size))
            next.set('sort', stringifySort(sorts))
            setSp(next, { replace: true })
        }, 150)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, page, size, sorts])

    const sortParams = sorts.map(s => `${s.field},${s.dir}`)
    const params = { q, page, size, sorts: sortParams }

    const queryClient = useQueryClient()
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
        onError: (_err, _id, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(['products', params], ctx.prev)
            // siia võid hiljem toasti lisada
            console.error('Delete failed')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })

    const rows: ProductDto[] = useMemo(() => data?.content ?? [], [data])

    function headerClick(e: MouseEvent, field: string) {
        setPage(0)
        const isShift = e.shiftKey
        setSorts(prev => {
            // Kui ilma shiftita: ainult üks tase, toggelda suunda kui sama veerg
            if (!isShift) {
                if (prev[0]?.field === field) {
                    const dir = prev[0].dir === 'asc' ? 'desc' : 'asc'
                    return [{ field, dir }]
                }
                return [{ field, dir: 'asc' }]
            }
            // Shift+click: lisa/toggelda olemasolevat taset
            const idx = prev.findIndex(s => s.field === field)
            if (idx === -1) return [...prev, { field, dir: 'asc' }]
            // kui on olemas, toggelda selle suunda (järjekorda ei muuda)
            const next = prev.slice()
            next[idx] = { field, dir: next[idx].dir === 'asc' ? 'desc' : 'asc' }
            return next
        })
    }

    function HeaderBtn({ field, title }: { field: string; title: string }) {
        const active = sorts[0]?.field === field
        return (
            <button
                type="button"
                onClick={(e) => headerClick(e, field)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                }}
                title={`${title} (click=primary sort, Shift+click=add/toggle secondary)`}
                aria-sort={
                    active ? (sorts[0].dir === 'asc' ? 'ascending' : 'descending') : 'none'
                }
            >
                {title}{active && <SortArrow dir={sorts[0].dir} />}
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

                    {/* Väike sortide ülevaade */}
                    <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>
            Sort: {sorts.map(s => `${s.field} ${s.dir}`).join(', ')}
          </span>

                    <label style={{ marginLeft: 12 }}>
                        Page size:{' '}
                        <select
                            value={size}
                            onChange={(e) => { setSize(Number(e.target.value)); setPage(0) }}
                        >
                            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                </div>

                <div className="actions" style={{ display: 'flex', gap: 8 }}>
                    <ColumnPicker value={cols} onChange={setCols} />
                    <Link className="btn" to="/products/new">Add product</Link>
                </div>
            </div>

            {!rows.length ? (
                <p>No products yet.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        {cols.id && <th><HeaderBtn field="id" title="ID" /></th>}
                        {cols.sku && <th><HeaderBtn field="sku" title="SKU" /></th>}
                        {cols.name && <th><HeaderBtn field="name" title="Name" /></th>}
                        {cols.price && <th><HeaderBtn field="price" title="Price" /></th>}
                        {cols.currency && <th><HeaderBtn field="currency" title="Currency" /></th>}
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((p) => (
                        <tr key={p.id}>
                            {cols.id && <td>{p.id}</td>}
                            {cols.sku && <td>{p.sku}</td>}
                            {cols.name && <td>{p.name}</td>}
                            {cols.price && <td>{formatMoneyFromMinor(p.priceCents, p.currencyCode, 'et-EE')}</td>}
                            {cols.currency && <td>{p.currencyCode}</td>}
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
