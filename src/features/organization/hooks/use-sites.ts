import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSite,
  deleteSite,
  getSites,
  updateSite,
} from '../api/organization-api'

export const sitesQueryKey = ['organization', 'sites'] as const
export const warehousesQueryKey = ['organization', 'warehouses'] as const

export function useSites() {
  return useQuery({ queryKey: sitesQueryKey, queryFn: getSites })
}

export function useCreateSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sitesQueryKey }),
  })
}

export function useUpdateSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateSite>[1]
    }) => updateSite(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sitesQueryKey }),
        queryClient.invalidateQueries({ queryKey: warehousesQueryKey }),
      ])
    },
  })
}

export function useDeleteSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSite,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sitesQueryKey }),
        queryClient.invalidateQueries({ queryKey: warehousesQueryKey }),
      ])
    },
  })
}
