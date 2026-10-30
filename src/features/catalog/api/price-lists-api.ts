import { apiClient, unwrap } from '@/shared/api'
import type { components } from '@/shared/api/generated/schema'
import type {
  PriceListItem,
  PriceListItemPayload,
  PriceListPayload,
} from '../types'

export type PriceList = components['schemas']['PriceListResponse']

export async function getPriceLists(): Promise<PriceList[]> {
  return unwrap(await apiClient.GET('/api/v1/price-lists'))
}

export async function createPriceList(
  payload: PriceListPayload,
): Promise<PriceList> {
  return unwrap(
    await apiClient.POST('/api/v1/price-lists', {
      body: payload,
    }),
  )
}

export async function updatePriceList(
  id: number,
  payload: PriceListPayload,
): Promise<PriceList> {
  return unwrap(
    await apiClient.PUT('/api/v1/price-lists/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deletePriceList(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/price-lists/{id}', {
      params: { path: { id } },
    }),
  )
}

export async function getPriceListItems(
  priceListId: number,
): Promise<PriceListItem[]> {
  return unwrap(
    await apiClient.GET('/api/v1/price-lists/{priceListId}/items', {
      params: { path: { priceListId } },
    }),
  )
}

export async function createPriceListItem(
  priceListId: number,
  payload: PriceListItemPayload,
): Promise<PriceListItem> {
  return unwrap(
    await apiClient.POST('/api/v1/price-lists/{priceListId}/items', {
      params: { path: { priceListId } },
      body: payload,
    }),
  )
}

export async function updatePriceListItem(
  priceListId: number,
  id: number,
  payload: PriceListItemPayload,
): Promise<PriceListItem> {
  return unwrap(
    await apiClient.PUT('/api/v1/price-lists/{priceListId}/items/{id}', {
      params: { path: { priceListId, id } },
      body: payload,
    }),
  )
}

export async function deletePriceListItem(
  priceListId: number,
  id: number,
): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/price-lists/{priceListId}/items/{id}', {
      params: { path: { priceListId, id } },
    }),
  )
}
