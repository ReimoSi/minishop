import { useState } from 'react'
import { apiPost } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { toMinorUnits } from '../lib/money'

type ProductCreateForm = {
    sku: string
    name: string
    price: string        // eurodes (nt "1.49")
    currencyCode: string
}

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export default function ProductNewPage() {
    const nav = useNavigate()
    const [form, setForm] = useState<ProductCreateForm>({
        sku: '',
        name: '',
        price: '',
        currencyCode: 'EUR',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function update<K extends keyof ProductCreateForm>(key: K, value: ProductCreateForm[K]) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        let cents: number
        try {
            cents = toMinorUnits(form.price, form.currencyCode)
            if (cents < 0) throw new Error('Price must be non-negative')
        } catch (err: any) {
            setError(err?.message || 'Invalid price')
            return
        }

        setSaving(true)
        try {
            const payload = {
                sku: form.sku.trim(),
                name: form.name.trim(),
                priceCents: cents,                 // BE ootab sentides
                currencyCode: form.currencyCode.toUpperCase(),
            }
            await apiPost<typeof payload, ProductDto>('/products', payload)
            nav('/products')
        } catch (err: any) {
            setError(err.message ?? 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="container">
            <div className="page-header">
                <button type="button" className="btn" onClick={() => nav(-1)}>← Back</button>
                <h1 style={{ margin: 0 }}>Add product</h1>
                <div />
            </div>

            <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
                <label htmlFor="sku">SKU</label>
                <input
                    id="sku"
                    placeholder="e.g. SKU-APPLE-001"
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

                <label htmlFor="price">Price</label>
                <input
                    id="price"
                    inputMode="decimal"
                    placeholder="e.g. 1.49"
                    value={form.price}
                    onChange={e => update('price', e.target.value)}
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
