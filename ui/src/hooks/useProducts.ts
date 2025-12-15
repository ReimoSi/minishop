import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { PageResp, ProductDto } from '../lib/api'

export type ProductQuery = {
    q: string
    page: number
    size: number
    sort: string // nt "id,asc"
}

export function useProducts(params: ProductQuery) {
    const search = new URLSearchParams({
        q: params.q ?? '',
        page: String(params.page ?? 0),
        size: String(params.size ?? 10),
        sort: params.sort ?? 'id,asc',
    }).toString()

    return useQuery({
        queryKey: ['products', params],
        queryFn: () => apiGet<PageResp<ProductDto>>(`/products/page?${search}`),
        // v5-s on "keepPreviousData" helper, mida kasutatakse placeholderData kaudu
        placeholderData: keepPreviousData,
    })
}
