import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGetPage } from '../lib/api'
import type { PageResp, ProductDto } from '../lib/api'

export type ProductQuery = {
    q?: string
    page?: number
    size?: number
    /** mitmetasemeline sort: iga element on "field,dir" (nt "price,desc") */
    sorts?: string[]
}

export function useProducts(params: ProductQuery) {
    const key = ['products', params] as const

    return useQuery<PageResp<ProductDto>, Error>({
        queryKey: key,
        queryFn: (): Promise<PageResp<ProductDto>> =>
            apiGetPage<ProductDto>('/products', {
                q: params.q ?? '',
                page: params.page ?? 0,
                size: params.size ?? 10,
                sorts: params.sorts ?? ['id,asc'],
            }),
        placeholderData: keepPreviousData,
    })
}
