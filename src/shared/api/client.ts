import createClient, { type Middleware } from 'openapi-fetch'
import { apiConfig } from '@/config/api'
import type { paths } from './generated/schema'
import {
  AppError,
  isAbortError,
  parseApiError,
  parseNetworkError,
} from './errors'

const apiClient = createClient<paths>({ baseUrl: apiConfig.baseUrl })

const requestMiddleware: Middleware = {
  onRequest({ request }) {
    // Add in-memory token injection here when the auth contract is available.
    return request
  },
}

const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) {
      return
    }

    const body: unknown = await response
      .clone()
      .json()
      .catch(() => undefined)
    throw parseApiError(body, response.status)
  },
  onError({ error }) {
    if (isAbortError(error)) {
      throw error
    }

    if (error instanceof AppError) {
      return error
    }

    return parseNetworkError(error) ?? parseApiError(undefined, 0)
  },
}

apiClient.use(requestMiddleware)
apiClient.use(errorMiddleware)

export { apiClient }
