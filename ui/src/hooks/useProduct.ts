import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { ProductDto } from '../lib/api'

export function useProduct(id: number | string | undefined) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => apiGet<ProductDto>(`/products/${id}`),
        enabled: !!id,
    })
}
