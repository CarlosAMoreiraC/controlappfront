import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPriceList,
  createPriceListItem,
  deletePriceList,
  deletePriceListItem,
  getPriceListItems,
  getPriceLists,
  updatePriceList,
  updatePriceListItem,
} from '../api/price-lists-api'

export const priceListsQueryKey = ['catalog', 'price-lists'] as const

export function usePriceLists() {
  return useQuery({ queryKey: priceListsQueryKey, queryFn: getPriceLists })
}

export function useCreatePriceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPriceList,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: priceListsQueryKey }),
  })
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updatePriceList>[1]
    }) => updatePriceList(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: priceListsQueryKey }),
  })
}

export function useDeletePriceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePriceList,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: priceListsQueryKey }),
  })
}

export function usePriceListItems(priceListId: number) {
  return useQuery({
    queryKey: [...priceListsQueryKey, priceListId, 'items'],
    queryFn: () => getPriceListItems(priceListId),
    enabled: Number.isInteger(priceListId) && priceListId > 0,
  })
}

export function useCreatePriceListItem(priceListId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof createPriceListItem>[1]) =>
      createPriceListItem(priceListId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...priceListsQueryKey, priceListId, 'items'],
      }),
  })
}

export function useUpdatePriceListItem(priceListId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updatePriceListItem>[2]
    }) => updatePriceListItem(priceListId, id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...priceListsQueryKey, priceListId, 'items'],
      }),
  })
}

export function useDeletePriceListItem(priceListId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deletePriceListItem(priceListId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...priceListsQueryKey, priceListId, 'items'],
      }),
  })
}
