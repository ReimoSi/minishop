import axios from 'axios'

/** Ühine Axiosi instants – kõik päringud lähevad /api alla (Vite proxy suunab 8080 peale). */
export const api = axios.create({ baseURL: '/api' })

/** Spring Page<> vastus, mis võib tulla kas top-level meta'ga või page-objektiga. */
type RawPage<T> =
    | {
    content: T[]
    // variant A (top-level meta)
    totalElements?: number
    totalPages?: number
    number?: number
    size?: number
    first?: boolean
    last?: boolean
}
    | {
    content: T[]
    // variant B (meta on 'page' all)
    page: {
        totalElements: number
        totalPages: number
        number: number
        size: number
    }
}

/** Ühtlustatud kuju, mida UI kasutab. */
export type PageResp<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
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

/** GET helper (toores) */
export async function apiGet<T>(url: string): Promise<T> {
    const { data } = await api.get<T>(url)
    return data
}

/** GET helper: normaliseeri Page kuju (top-level vs page:{...}). */
export async function apiGetPage<T>(url: string): Promise<PageResp<T>> {
    const raw = await apiGet<RawPage<T>>(url)
    const content = (raw as any).content ?? []

    // variant: meta on 'page' all
    if ((raw as any).page) {
        const p = (raw as any).page
        const number = p.number ?? 0
        const size = p.size ?? content.length
        const totalPages = p.totalPages ?? 1
        const totalElements = p.totalElements ?? content.length
        return {
            content,
            totalElements,
            totalPages,
            number,
            size,
            first: number === 0,
            last: totalPages <= 1 || number >= totalPages - 1,
        }
    }

    // top-level meta
    const number = (raw as any).number ?? 0
    const size = (raw as any).size ?? content.length
    const totalPages = (raw as any).totalPages ?? 1
    const totalElements = (raw as any).totalElements ?? content.length
    const first = (raw as any).first ?? (number === 0)
    const last = (raw as any).last ?? (totalPages <= 1 || number >= totalPages - 1)

    return {
        content,
        totalElements,
        totalPages,
        number,
        size,
        first,
        last,
    }
}


/** POST helper (viskab backendist message välja) */
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

/** DELETE helper */
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
