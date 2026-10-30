import { apiClient, unwrap } from '@/shared/api'
import type { CustomerType, CustomerTypePayload } from '../types'

export async function getCustomerTypes(): Promise<CustomerType[]> {
  return unwrap(await apiClient.GET('/api/v1/customer-types'))
}

export async function createCustomerType(
  payload: CustomerTypePayload,
): Promise<CustomerType> {
  return unwrap(
    await apiClient.POST('/api/v1/customer-types', { body: payload }),
  )
}

export async function updateCustomerType(
  id: number,
  payload: CustomerTypePayload,
): Promise<CustomerType> {
  return unwrap(
    await apiClient.PUT('/api/v1/customer-types/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deleteCustomerType(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/customer-types/{id}', {
      params: { path: { id } },
    }),
  )
}
