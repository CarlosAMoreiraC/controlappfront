import { parseApiError } from './errors'

interface OpenApiResult<TData> {
  data?: TData
  error?: unknown
  response: Response
}

export function unwrap<TData>(
  result: OpenApiResult<TData>,
): Exclude<TData, undefined>
export function unwrap(result: OpenApiResult<never>): void
export function unwrap(result: OpenApiResult<unknown>): unknown {
  if (result.error !== undefined) {
    throw parseApiError(result.error, result.response.status)
  }

  if (result.response.status === 204) {
    return
  }

  if (result.data === undefined) {
    throw parseApiError(undefined, result.response.status)
  }

  return result.data
}
