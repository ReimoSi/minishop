import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet, normalizePage } from '../lib/api'
import type { PageResp, ProductDto } from '../lib/api'

export type ProductQuery = {
    q?: string
    page?: number
    size?: number
    sort?: string // nt "id,asc" või "price,desc"
}

export function useProducts(params: ProductQuery) {
    const qs = new URLSearchParams({
        page: String(params.page ?? 0),
        size: String(params.size ?? 10),
    })
    if (params.q && params.q.length > 0) qs.set('q', params.q)
    if (params.sort && params.sort.length > 0) qs.append('sort', params.sort)

    return useQuery({
        // hoia key stabiilne; objektina (või võta params otse)
        queryKey: ['products', { q: params.q ?? '', page: params.page ?? 0, size: params.size ?? 10, sort: params.sort ?? '' }],
        // NB: uus endpoint: /products (mitte /products/page)
        queryFn: () =>
            apiGet<any>(`/products?${qs.toString()}`).then((raw) =>
                normalizePage<ProductDto>(raw),
            ) as Promise<PageResp<ProductDto>>,
        placeholderData: keepPreviousData,
    })
}
