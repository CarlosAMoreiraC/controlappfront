import { apiClient, unwrap } from '@/shared/api'
import type { Customer, CustomerPayload } from '../types'

export async function getCustomers(): Promise<Customer[]> {
  return unwrap(await apiClient.GET('/api/v1/customers'))
}

export async function createCustomer(
  payload: CustomerPayload,
): Promise<Customer> {
  return unwrap(
    await apiClient.POST('/api/v1/customers', {
      body: payload,
    }),
  )
}

export async function updateCustomer(
  id: number,
  payload: CustomerPayload,
): Promise<Customer> {
  return unwrap(
    await apiClient.PUT('/api/v1/customers/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deleteCustomer(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/customers/{id}', {
      params: { path: { id } },
    }),
  )
}
