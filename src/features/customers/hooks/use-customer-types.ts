import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomerType,
  deleteCustomerType,
  getCustomerTypes,
  updateCustomerType,
} from '../api/customer-types-api'

export const customerTypesQueryKey = ['customer-types'] as const

export function useCustomerTypes() {
  return useQuery({
    queryKey: customerTypesQueryKey,
    queryFn: getCustomerTypes,
  })
}

export function useCreateCustomerType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomerType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerTypesQueryKey }),
  })
}

export function useUpdateCustomerType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateCustomerType>[1]
    }) => updateCustomerType(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerTypesQueryKey }),
  })
}

export function useDeleteCustomerType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomerType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerTypesQueryKey }),
  })
}
