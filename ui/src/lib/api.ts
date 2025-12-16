import axios from 'axios'

/** Ühine Axiosi instants – kõik päringud lähevad /api alla (Vite proxy suunab 8080 peale). */
export const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

/** GET helper */
export async function apiGet<T>(url: string): Promise<T> {
    const { data } = await api.get<T>(url)
    return data
}

/** POST helper (tagastab veateate backendist, kui olemas) */
export async function apiPost<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
    try {
        const { data } = await api.post<TRes>(url, body)
        return data
    } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
            const msg =
                (err.response.data && (err.response.data as any).message) ||
                err.message ||
                'Request failed'
            throw new Error(msg)
        }
        throw err
    }
}

/** DELETE helper (sama veateadete loogika) */
export async function apiDelete(url: string): Promise<void> {
    try {
        await api.delete(url)
    } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
            const msg =
                (err.response.data && (err.response.data as any).message) ||
                err.message ||
                'Request failed'
            throw new Error(msg)
        }
        throw err
    }
}

/** Spring Page<> (flat) kuju, mida UI kasutab */
export type PageResp<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number // current page (0-based)
    size: number
    first: boolean
    last: boolean
}

/** Peab ühtima backend ProductDto-ga */
export type ProductDto = {
    id?: number
    sku: string
    name: string
    priceCents: number
    currencyCode: string
}

/**
 * Normaliseeri backend vastus UI ootuseks:
 * - toetab Sinu backendi kuju: { content, page{size,number,totalElements,totalPages} }
 * - toetab ka Springi flat kuju (juhuks kui kunagi muutub)
 */
export function normalizePage<T = unknown>(raw: any): PageResp<T> {
    // Kuju A: { content, page: { size, number, totalElements, totalPages } }
    if (raw?.page && typeof raw.page === 'object') {
        const p = raw.page
        const number = Number(p.number ?? 0)
        const totalPages = Number(p.totalPages ?? 0)
        return {
            content: (raw.content ?? []) as T[],
            number,
            size: Number(p.size ?? 20),
            totalElements: Number(p.totalElements ?? 0),
            totalPages,
            first: number <= 0,
            last: number >= Math.max(0, totalPages - 1),
        }
    }
    // Kuju B: flat Spring Page<>
    return {
        content: (raw?.content ?? []) as T[],
        number: Number(raw?.number ?? 0),
        size: Number(raw?.size ?? 20),
        totalElements: Number(raw?.totalElements ?? 0),
        totalPages: Number(raw?.totalPages ?? 0),
        first: Boolean(raw?.first ?? (Number(raw?.number ?? 0) <= 0)),
        last: Boolean(
            raw?.last ??
            (Number(raw?.number ?? 0) >= Math.max(0, Number(raw?.totalPages ?? 0) - 1)),
        ),
    }
}
