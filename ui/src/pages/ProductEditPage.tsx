import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, apiGet } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useToast } from '../components/ToastProvider'

type ProductEditForm = {
    sku: string
    name: string
    priceCents: string
    currencyCode: string
}

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export default function ProductEditPage() {
    const nav = useNavigate()
    const { id } = useParams()
    const pid = Number(id)
    const { show } = useToast()

    const [form, setForm] = useState<ProductEditForm>({
        sku: '',
        name: '',
        priceCents: '',
        currencyCode: 'EUR',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function update<K extends keyof ProductEditForm>(key: K, value: ProductEditForm[K]) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const p = await apiGet<ProductDto>(`/products/${pid}`)
                if (!mounted) return
                setForm({
                    sku: p.sku,
                    name: p.name,
                    priceCents: String(p.priceCents),
                    currencyCode: p.currencyCode,
                })
            } catch (e: any) {
                setError(e?.message ?? 'Load failed')
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [pid])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        const cents = parseInt(form.priceCents, 10)
        if (Number.isNaN(cents) || cents < 0) {
            const msg = 'Price must be a non-negative integer (cents).'
            setError(msg)
            show(msg, 'error')
            return
        }

        setSaving(true)
        try {
            const payload: ProductDto = {
                id: pid,
                sku: form.sku.trim().toUpperCase(),
                name: form.name.trim(),
                priceCents: cents,
                currencyCode: form.currencyCode.toUpperCase(),
            }
            await api.put<ProductDto>(`/products/${pid}`, payload)
            show('Product updated', 'success')
            nav('/products')
        } catch (err: any) {
            const msg = err?.message ?? 'Save failed'
            setError(msg)
            show(msg, 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p style={{ padding: 24 }}>Loading…</p>

    return (
        <div className="container">
            <h1>Edit product #{pid}</h1>
            <div style={{ marginBottom: 10 }}>
                <Link to="/products">← Back</Link>
            </div>

            <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
                <label htmlFor="sku">SKU</label>
                <input
                    id="sku"
                    value={form.sku}
                    onChange={e => update('sku', e.target.value.toUpperCase())}
                    maxLength={40}
                    required
                />

                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    maxLength={200}
                    required
                />

                <label htmlFor="price">Price (cents)</label>
                <input
                    id="price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.priceCents}
                    onChange={e => update('priceCents', e.target.value)}
                    required
                />

                <label htmlFor="currency">Currency</label>
                <select
                    id="currency"
                    value={form.currencyCode}
                    onChange={e => update('currencyCode', e.target.value)}
                    required
                >
                    {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}

                <div className="form-actions">
                    <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    <button type="button" onClick={() => nav('/products')} disabled={saving}>Cancel</button>
                </div>
            </form>
        </div>
    )
}
