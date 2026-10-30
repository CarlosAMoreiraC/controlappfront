import type { components } from '@/shared/api/generated/schema'

export type Customer = components['schemas']['CustomerResponse']
export type CustomerPayload = components['schemas']['CreateCustomerRequest']
export type CustomerType = components['schemas']['CustomerTypeResponse']
export type CustomerTypePayload =
  components['schemas']['CreateCustomerTypeRequest']
