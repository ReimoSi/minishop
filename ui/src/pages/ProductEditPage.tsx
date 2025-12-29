import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct'
import { apiPut } from '../lib/api'
import type { ProductDto } from '../lib/api'
import { toMinorUnits } from '../lib/money'

type Form = {
    sku: string
    name: string
    price: string        // eurodes
    currencyCode: string
}

export default function ProductEditPage() {
    const nav = useNavigate()
    const { id } = useParams()
    const { data, isLoading, isError, error } = useProduct(id)
    const [form, setForm] = useState<Form>({ sku: '', name: '', price: '', currencyCode: 'EUR' })
    const [saving, setSaving] = useState(false)
    const [errMsg, setErrMsg] = useState<string | null>(null)

    useEffect(() => {
        if (data) {
            const priceEuros = (data.priceCents / 100).toFixed(2)
            setForm({
                sku: data.sku,
                name: data.name,
                price: priceEuros,
                currencyCode: data.currencyCode,
            })
        }
    }, [data])

    function update<K extends keyof Form>(k: K, v: Form[K]) {
        setForm(prev => ({ ...prev, [k]: v }))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrMsg(null)
        try {
            const priceCents = toMinorUnits(form.price, form.currencyCode)
            const payload: ProductDto = {
                sku: form.sku.trim(),
                name: form.name.trim(),
                priceCents,
                currencyCode: form.currencyCode.toUpperCase(),
            }
            setSaving(true)
            await apiPut<ProductDto, ProductDto>(`/products/${id}`, payload)
            nav('/products')
        } catch (err: any) {
            setErrMsg(err?.message ?? 'Update failed')
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) return <div className="container"><p>Loading…</p></div>
    if (isError) return <div className="container"><p style={{color:'crimson'}}>Error: {(error as Error)?.message ?? 'unknown'}</p></div>

    return (
        <div className="container">
            <div className="page-header">
                <button type="button" className="btn" onClick={() => nav(-1)}>← Back</button>
                <h1 style={{ margin: 0 }}>Edit product #{id}</h1>
                <div />
            </div>

            <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
                <label htmlFor="sku">SKU</label>
                <input id="sku" value={form.sku} onChange={e=>update('sku', e.target.value.toUpperCase())} maxLength={40} required />

                <label htmlFor="name">Name</label>
                <input id="name" value={form.name} onChange={e=>update('name', e.target.value)} maxLength={200} required />

                <label htmlFor="price">Price</label>
                <input id="price" inputMode="decimal" value={form.price} onChange={e=>update('price', e.target.value)} required />

                <label htmlFor="curr">Currency</label>
                <select id="curr" value={form.currencyCode} onChange={e=>update('currencyCode', e.target.value)} required>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                </select>

                {errMsg && <p style={{ color: 'crimson', marginTop: 8 }}>{errMsg}</p>}

                <div className="form-actions">
                    <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    <button type="button" onClick={() => nav('/products')} disabled={saving}>Cancel</button>
                </div>
            </form>
        </div>
    )
}
