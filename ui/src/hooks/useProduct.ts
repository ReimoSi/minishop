import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import type { ProductDto } from '../lib/api'

export function useProduct(id: number | string | undefined) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (id === undefined || id === null) throw new Error('Missing id')
            return await apiGet<ProductDto>(`/products/${id}`)
        },
        enabled: id !== undefined && id !== null,
    })
}

