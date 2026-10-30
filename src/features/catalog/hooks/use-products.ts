import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../api/products-api'

export const productsQueryKey = ['catalog', 'products'] as const

export function useProducts() {
  return useQuery({ queryKey: productsQueryKey, queryFn: getProducts })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateProduct>[1]
    }) => updateProduct(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsQueryKey }),
  })
}
