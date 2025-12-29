import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGetPage } from '../lib/api'
import type { PageResp, ProductDto } from '../lib/api'

export type ProductQuery = {
    q: string
    page: number
    size: number
    sort: string // nt "price,desc"
}

export function useProducts(params: ProductQuery) {
    const search = new URLSearchParams({
        ...(params.q ? { q: params.q } : {}),
        page: String(params.page ?? 0),
        size: String(params.size ?? 10),
        sort: params.sort ?? 'id,asc',
    }).toString()

    return useQuery({
        queryKey: ['products', params],
        // NB! backendis on GET /api/products (mitte /products/page)
        queryFn: () => apiGetPage<ProductDto>(`/products?${search}`),
        placeholderData: keepPreviousData,
    })
}
