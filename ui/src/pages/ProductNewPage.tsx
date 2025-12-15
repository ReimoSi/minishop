import { useState } from 'react'
import { apiPost } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useNavigate } from 'react-router-dom'

type ProductCreate = {
    sku: string
    name: string
    priceCents: number
    currencyCode: string
}

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export default function ProductNewPage() {
    const nav = useNavigate()
    const [form, setForm] = useState<ProductCreate>({
        sku: '',
        name: '',
        priceCents: 0,
        currencyCode: 'EUR',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            // väike kaitse: priceCents peab olema >= 0 täisarv
            const price = Number.isFinite(form.priceCents) ? Math.trunc(form.priceCents) : 0
            await apiPost<ProductCreate, ProductDto>('/products', { ...form, priceCents: Math.max(0, price) })
            nav('/products')
        } catch (err: any) {
            setError(err.message ?? 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    function update<K extends keyof ProductCreate>(key: K, value: ProductCreate[K]) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="container">
            <h1>Add product</h1>
            <form onSubmit={onSubmit} style={{ maxWidth: 480 }}>
                <label>SKU</label>
                <input
                    value={form.sku}
                    onChange={e => update('sku', e.target.value)}
                    required
                    maxLength={40}
                    placeholder="e.g. SKU-APPLE-001"
                />

                <label>Name</label>
                <input
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    maxLength={200}
                />

                <label>Price (cents)</label>
                <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={form.priceCents}
                    onChange={e => update('priceCents', Number(e.target.value))}
                    required
                />

                <label>Currency</label>
                <select
                    value={form.currencyCode}
                    onChange={e => update('currencyCode', e.target.value as ProductCreate['currencyCode'])}
                    required
                >
                    {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {error && <p style={{ color: 'crimson' }}>{error}</p>}

                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => nav('/products')} disabled={saving}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
