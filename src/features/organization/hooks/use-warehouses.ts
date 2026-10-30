import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from '../api/organization-api'
import { warehousesQueryKey } from './use-sites'

export function useWarehouses(siteId?: number) {
  return useQuery({
    queryKey: [...warehousesQueryKey, siteId ?? null],
    queryFn: () => getWarehouses(siteId),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: warehousesQueryKey }),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateWarehouse>[1]
    }) => updateWarehouse(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: warehousesQueryKey }),
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: warehousesQueryKey }),
  })
}
