import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../api/customers-api'

export const customersQueryKey = ['customers'] as const

export function useCustomers() {
  return useQuery({ queryKey: customersQueryKey, queryFn: getCustomers })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateCustomer>[1]
    }) => updateCustomer(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })
}
