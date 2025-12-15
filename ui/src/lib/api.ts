import axios from 'axios'

/** Ühine Axiosi instants – kõik päringud lähevad /api alla (Vite proxy suunab 8080 peale). */
export const api = axios.create({
    baseURL: '/api',
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

/** Spring Page<> vastus */
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
