import { apiClient, unwrap } from '@/shared/api'
import type { Product, ProductPayload } from '../types'

export async function getProducts(): Promise<Product[]> {
  return unwrap(await apiClient.GET('/api/v1/products'))
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  return unwrap(
    await apiClient.POST('/api/v1/products', {
      body: payload,
    }),
  )
}

export async function updateProduct(
  id: number,
  payload: ProductPayload,
): Promise<Product> {
  return unwrap(
    await apiClient.PUT('/api/v1/products/{id}', {
      params: { path: { id } },
      body: payload,
    }),
  )
}

export async function deleteProduct(id: number): Promise<void> {
  unwrap(
    await apiClient.DELETE('/api/v1/products/{id}', {
      params: { path: { id } },
    }),
  )
}
