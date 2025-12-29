import axios from 'axios'

/** Ühine Axiosi instants – kõik päringud lähevad /api alla (Vite proxy suunab 8080 peale). */
export const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

/** Spring Page<> -> meie UI PageResp kuju */
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

/** GET helper, mis mapib Spring Page<> kuju PageRespiks
 *  Toetab mõlemat:
 *   - Spring default (content, totalPages, number, size, first, last, ...)
 *   - sinu varasem kuju (content + page{ size, number, totalElements, totalPages })
 */
export async function apiGetPage<T>(url: string): Promise<PageResp<T>> {
    const { data } = await api.get<any>(url)

    const spring = data ?? {}
    const pageBlock = spring.page ?? spring

    const content: T[] = spring.content ?? []
    const size: number = pageBlock.size ?? spring.pageable?.pageSize ?? 0
    const number: number = pageBlock.number ?? spring.number ?? 0
    const totalElements: number = pageBlock.totalElements ?? spring.totalElements ?? content.length
    const totalPages: number = pageBlock.totalPages ?? spring.totalPages ?? 1
    const first: boolean = typeof spring.first === 'boolean' ? spring.first : number === 0
    const last: boolean =
        typeof spring.last === 'boolean' ? spring.last : (totalPages ? number + 1 >= totalPages : true)

    return { content, totalElements, totalPages, number, size, first, last }
}

/** POST helper (tagastab backend ApiError.message kui olemas) */
export async function apiPost<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
    try {
        const { data } = await api.post<TRes>(url, body)
        return data
    } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
            const msg = (err.response.data && (err.response.data as any).message) || err.message || 'Request failed'
            throw new Error(msg)
        }
        throw err
    }
}

/** PUT helper */
export async function apiPut<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
    try {
        const { data } = await api.put<TRes>(url, body)
        return data
    } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
            const msg = (err.response.data && (err.response.data as any).message) || err.message || 'Request failed'
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
            const msg = (err.response.data && (err.response.data as any).message) || err.message || 'Request failed'
            throw new Error(msg)
        }
        throw err
    }
}
