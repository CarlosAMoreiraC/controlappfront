import { apiClient, unwrap } from '@/shared/api'
import type {
  Site,
  SitePayload,
  Warehouse,
  WarehousePayload,
  WarehouseUpdatePayload,
} from '../types'

export async function getSites(): Promise<Site[]> {
  return unwrap(await apiClient.GET('/api/v1/sites'))
}

export async function createSite(payload: SitePayload): Promise<Site> {
  return unwrap(
    await apiClient.POST('/api/v1/sites', {
      body: payload,
    }),
  )
}

export async function updateSite(
  id: number,
  payload: SitePayload,
): Promise<Site> {
  return unwrap(
    await apiClient.PUT('/api/v1/sites/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deleteSite(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/sites/{id}', { params: { path: { id } } }),
  )
}

export async function getWarehouses(siteId?: number): Promise<Warehouse[]> {
  const options =
    siteId === undefined ? undefined : { params: { query: { siteId } } }
  return unwrap(await apiClient.GET('/api/v1/warehouses', options))
}

export async function createWarehouse(
  payload: WarehousePayload,
): Promise<Warehouse> {
  return unwrap(
    await apiClient.POST('/api/v1/warehouses', {
      body: payload,
    }),
  )
}

export async function updateWarehouse(
  id: number,
  payload: WarehouseUpdatePayload,
): Promise<Warehouse> {
  return unwrap(
    await apiClient.PUT('/api/v1/warehouses/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deleteWarehouse(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/warehouses/{id}', {
      params: { path: { id } },
    }),
  )
}
