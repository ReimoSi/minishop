import { useId } from 'react'

export type ProductColumns = {
    id: boolean
    sku: boolean
    name: boolean
    price: boolean
    currency: boolean
}

type Props = {
    value: ProductColumns
    onChange: (next: ProductColumns) => void
}

export default function ColumnPicker({ value, onChange }: Props) {
    const idBase = useId()
    function toggle(key: keyof ProductColumns) {
        onChange({ ...value, [key]: !value[key] })
    }

    return (
        <details className="cols-menu">
            <summary>Columns ▾</summary>
            <div className="cols-menu-panel">
                <label><input type="checkbox" checked={value.id} onChange={() => toggle('id')} /> ID</label>
                <label><input type="checkbox" checked={value.sku} onChange={() => toggle('sku')} /> SKU</label>
                <label><input type="checkbox" checked={value.name} onChange={() => toggle('name')} /> Name</label>
                <label><input type="checkbox" checked={value.price} onChange={() => toggle('price')} /> Price</label>
                <label><input type="checkbox" checked={value.currency} onChange={() => toggle('currency')} /> Currency</label>
            </div>
        </details>
    )
}

export const DEFAULT_PRODUCT_COLUMNS: ProductColumns = {
    id: true,
    sku: true,
    name: true,
    price: true,
    currency: true,
}
