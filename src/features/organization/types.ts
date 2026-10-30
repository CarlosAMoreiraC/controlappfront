import type { components } from '@/shared/api/generated/schema'

export type Site = components['schemas']['SiteResponse']
export type SitePayload = components['schemas']['CreateSiteRequest']
export type Warehouse = components['schemas']['WarehouseResponse']
export type WarehousePayload = components['schemas']['CreateWarehouseRequest']
export type WarehouseUpdatePayload =
  components['schemas']['UpdateWarehouseRequest']
