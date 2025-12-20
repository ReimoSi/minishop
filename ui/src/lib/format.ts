export function formatMoney(priceCents: number, currency: string) {
    const amount = (priceCents ?? 0) / 100
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'EUR',
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        return `${amount.toFixed(2)} ${currency || ''}`.trim()
    }
}
