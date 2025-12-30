import axios from 'axios'

/** Ühine Axiosi instants – kõik päringud lähevad /api alla (Vite proxy suunab 8080 peale). */
export const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

/** Spring Page<> vastus (normaliseeritud väljad). */
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

/** GET helper */
export async function apiGet<T>(url: string): Promise<T> {
    const { data } = await api.get<T>(url)
    return data
}

/**
 * Lehega GET, toetab q/page/size ja MITUT sort’i.
 * sorts = ["price,desc","name,asc"]  ->  ?sort=price,desc&sort=name,asc
 */
export async function apiGetPage<T>(
    path: string,
    params: { q?: string; page?: number; size?: number; sorts?: string[] }
): Promise<PageResp<T>> {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    sp.set('page', String(params.page ?? 0))
    sp.set('size', String(params.size ?? 10))
    ;(params.sorts ?? ['id,asc']).forEach(s => sp.append('sort', s))

    const url = `${path}?${sp.toString()}`
    // Spring Data Page’i erinevad kujud – normaliseerime
    const { data } = await api.get<any>(url)

    // Kui backend juba tagastab {content, page:{...}} (sinu varasem JSON),
    // normaliseerime üheks PageResp vormiks:
    if (data && data.content && data.page) {
        const p = data.page
        return {
            content: data.content as T[],
            totalElements: p.totalElements,
            totalPages: p.totalPages,
            number: p.number,
            size: p.size,
            first: p.number === 0,
            last: p.number + 1 >= p.totalPages,
        }
    }

    // Kui backend kasutab Spring default Page JSON kuju (number/size/totalPages/totalElements olemas),
    // tagasta otse (lisades first/last kui vaja)
    if (data && Array.isArray(data.content)) {
        return {
            content: data.content as T[],
            totalElements: data.totalElements ?? 0,
            totalPages: data.totalPages ?? 1,
            number: data.number ?? 0,
            size: data.size ?? (data.content?.length ?? 0),
            first: data.first ?? (data.number === 0),
            last: data.last ?? (data.number + 1 >= (data.totalPages ?? 1)),
        }
    }

    // Fallback (ei tohiks siia jõuda)
    return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: params.size ?? 10,
        first: true,
        last: true,
    }
}

/** POST helper (tagastab backend error.message, kui olemas) */
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
