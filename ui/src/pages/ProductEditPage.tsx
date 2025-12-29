import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useProduct } from '../hooks/useProduct'
import { apiPut } from '../lib/api'
import type { ProductDto } from '../lib/api'

type ProductEditForm = {
    sku: string
    name: string
    priceCents: string // hoian stringina, et tühjus ja mittetäisarv oleks hallatav
    currencyCode: string
}

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export default function ProductEditPage() {
    const { id } = useParams()
    const pid = Number(id)
    const nav = useNavigate()
    const qc = useQueryClient()

    const { data, isLoading, isError, error } = useProduct(pid)

    const [form, setForm] = useState<ProductEditForm>({
        sku: '',
        name: '',
        priceCents: '',
        currencyCode: 'EUR',
    })
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    // lae serveri andmed vormi
    useEffect(() => {
        if (data) {
            setForm({
                sku: data.sku ?? '',
                name: data.name ?? '',
                priceCents: String(data.priceCents ?? ''),
                currencyCode: data.currencyCode ?? 'EUR',
            })
        }
    }, [data])

    function update<K extends keyof ProductEditForm>(key: K, value: ProductEditForm[K]) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const putMutation = useMutation({
        mutationFn: (payload: ProductDto) => apiPut<ProductDto, ProductDto>(`/products/${pid}`, payload),
        onSuccess: () => {
            // värskenda listi ja selle toote cache
            qc.invalidateQueries({ queryKey: ['products'] })
            qc.invalidateQueries({ queryKey: ['product', pid] })
        },
    })

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setMsg(null)

        // lihtne front valida
        const cents = parseInt(form.priceCents, 10)
        if (Number.isNaN(cents) || cents < 0) {
            setMsg('Price must be a non-negative integer (cents).')
            return
        }
        if (!form.sku.trim()) {
            setMsg('SKU is required.')
            return
        }
        if (!form.name.trim()) {
            setMsg('Name is required.')
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
            await putMutation.mutateAsync(payload)
            nav('/products')
        } catch (err: any) {
            setMsg(err?.message ?? 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container">
                <div className="page-header">
                    <button className="btn" onClick={() => nav(-1)} type="button">← Back</button>
                    <h1 style={{ margin: 0 }}>Edit product #{pid}</h1>
                    <div />
                </div>
                <p>Loading…</p>
            </div>
        )
    }

    if (isError) {
        // kui backend tagastab 404, näitame sõnumit
        return (
            <div className="container">
                <div className="page-header">
                    <button className="btn" onClick={() => nav(-1)} type="button">← Back</button>
                    <h1 style={{ margin: 0 }}>Edit product #{pid}</h1>
                    <div />
                </div>
                <p style={{ color: 'crimson' }}>Error: {(error as Error)?.message ?? 'Failed to load product'}</p>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="page-header">
                <button className="btn" onClick={() => nav(-1)} type="button">← Back</button>
                <h1 style={{ margin: 0 }}>Edit product #{pid}</h1>
                <div />
            </div>

            <form onSubmit={onSubmit} className="form-grid">
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

                <label htmlFor="priceCents">Price (cents)</label>
                <input
                    id="priceCents"
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
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {msg && <div className="error">{msg}</div>}

                <div className="actions">
                    <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    <button type="button" className="btn" onClick={() => nav('/products')} disabled={saving}>Cancel</button>
                </div>
            </form>
        </div>
    )
}
