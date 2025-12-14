import axios from 'axios'

export const api = axios.create({
    baseURL: '/api',
})

export async function apiGet<T>(url: string): Promise<T> {
    const { data } = await api.get<T>(url)
    return data
}

export async function apiPost<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
    const { data } = await api.post<TRes>(url, body)
    return data
}

export async function apiDelete(url: string): Promise<void> {
    await api.delete(url)
}

// >>> EKSPORDI TÜÜP! <<<
export type ProductDto = {
    id?: number
    sku: string
    name: string
    priceCents: number
    currencyCode: string
}
