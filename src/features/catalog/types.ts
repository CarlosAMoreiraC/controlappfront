import type { components } from '@/shared/api/generated/schema'

export type Product = components['schemas']['ProductResponse']
export type ProductPayload = components['schemas']['CreateProductRequest']
export type PriceList = components['schemas']['PriceListResponse']
export type PriceListPayload = components['schemas']['CreatePriceListRequest']
export type PriceListItem = components['schemas']['PriceListItemResponse']
export type PriceListItemPayload =
  components['schemas']['CreatePriceListItemRequest']
