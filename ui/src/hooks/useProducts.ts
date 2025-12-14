import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { ProductDto } from '../types/product'

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async (): Promise<ProductDto[]> => {
            const { data } = await api.get<ProductDto[]>('/products')
            return data
        },
    })
}
