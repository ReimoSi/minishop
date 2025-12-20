// Lubatud minor_units: EUR/USD/GBP=2, JPY=0, KWD/BHD/JOD/OMR/TND=3 jne.
// Vajadusel täienda loendit; tundmatu -> 2.
const MINOR_UNITS: Record<string, number> = {
    EUR: 2, USD: 2, GBP: 2,
    JPY: 0, KRW: 0, VND: 0,
    KWD: 3, BHD: 3, JOD: 3, OMR: 3, TND: 3,
}

export function minorUnitsFor(code: string | undefined | null): number {
    if (!code) return 2
    return MINOR_UNITS[code.toUpperCase()] ?? 2
}

/**
 * Konverteeri kasutaja sisestatud hind (eurodes) väikseimasse ühikusse (täisarv).
 * Näide: "1.49" + EUR (2) -> 149
 * - Lubab "," või "." komakoha märgina
 * - Kontrollib, et murdosa kohti pole rohkem kui valuuta lubab
 */
export function toMinorUnits(input: string, currencyCode: string): number {
    const minor = minorUnitsFor(currencyCode)
    const trimmed = (input ?? '').trim()
    if (!trimmed) throw new Error('Price is required')

    // Normaliseeri koma -> punkt (et "1,49" töötaks)
    const normalized = trimmed.replace(',', '.')
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error('Invalid price format')
    }

    const [ints, fracRaw = ''] = normalized.split('.')
    if (fracRaw.length > minor) {
        throw new Error(`Too many decimal places for ${currencyCode} (max ${minor})`)
    }
    const frac = fracRaw.padEnd(minor, '0')
    // Väldi ujukoma: liida numbrijadad kokku
    const digits = `${ints}${frac}`
    // Kaitse ülearu suurte numbrite vastu
    const n = Number(digits)
    if (!Number.isFinite(n)) throw new Error('Price is too large')
    return n
}

/** Vorminda minor-unit väärtus valuutana */
export function formatMoneyFromMinor(minorValue: number, currencyCode: string, locale: string | undefined = 'et-EE'): string {
    const minor = minorUnitsFor(currencyCode)
    const factor = Math.pow(10, minor)
    const major = (minorValue ?? 0) / factor
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode || 'EUR',
            minimumFractionDigits: minor,
            maximumFractionDigits: minor,
            currencyDisplay: 'narrowSymbol',
        }).format(major)
    } catch {
        return `${major.toFixed(minor)} ${currencyCode || ''}`.trim()
    }
}
