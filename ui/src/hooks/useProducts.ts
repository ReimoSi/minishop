import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGetPage } from '../lib/api'
import type { PageResp, ProductDto } from '../lib/api'

export type ProductQuery = {
    q?: string
    page?: number
    size?: number
    sort?: string | string[]   // <-- lubame mõlemat
}

export function useProducts(params: ProductQuery) {
    const search = new URLSearchParams()
    if (params.q) search.set('q', params.q)
    search.set('page', String(params.page ?? 0))
    search.set('size', String(params.size ?? 10))

    const sorts: string[] = Array.isArray(params.sort)
        ? params.sort
        : params.sort
            ? [params.sort]
            : ['id,asc']                   // default

    sorts.forEach(s => search.append('sort', s))

    return useQuery({
        queryKey: ['products', { ...params, sort: sorts }],
        queryFn: () => apiGetPage<ProductDto>(`/products?${search.toString()}`),
        placeholderData: keepPreviousData,
    })
}
