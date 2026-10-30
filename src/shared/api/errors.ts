import type { components } from './generated/schema'
import { uiText } from '@/shared/i18n/texts'

export type AppErrorKind =
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'network'
  | 'server'
  | 'unknown'

export type FieldErrors = Record<string, string>

export class AppError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string
  readonly fieldErrors: FieldErrors
  readonly kind: AppErrorKind

  constructor(
    status: number,
    title: string,
    detail: string,
    fieldErrors: FieldErrors,
    kind: AppErrorKind,
  ) {
    super(detail)
    this.name = 'AppError'
    this.status = status
    this.title = title
    this.detail = detail
    this.fieldErrors = fieldErrors
    this.kind = kind
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

function hasErrorName(error: unknown, name: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === name
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFieldError(
  value: unknown,
): value is components['schemas']['FieldError'] {
  return (
    isRecord(value) &&
    typeof value.field === 'string' &&
    typeof value.message === 'string'
  )
}

function getKind(status: number, fieldErrors: FieldErrors): AppErrorKind {
  if (status === 0) {
    return 'network'
  }

  if (status === 404) {
    return 'not_found'
  }

  if (status === 401) {
    return 'unauthorized'
  }

  if (status === 403) {
    return 'forbidden'
  }

  if (status === 409) {
    return 'conflict'
  }

  if (status >= 500) {
    return 'server'
  }

  if (status === 400 || status === 422 || Object.keys(fieldErrors).length > 0) {
    return 'validation'
  }

  return 'unknown'
}

export function parseApiError(body: unknown, status: number): AppError {
  const parsedBody = isRecord(body) ? body : undefined
  const title =
    parsedBody && typeof parsedBody.title === 'string'
      ? parsedBody.title
      : undefined
  const serverDetail =
    parsedBody &&
    typeof parsedBody.detail === 'string' &&
    parsedBody.detail.length > 0
      ? parsedBody.detail
      : undefined
  const serverFieldErrors =
    parsedBody && Array.isArray(parsedBody.errors)
      ? parsedBody.errors.filter(isFieldError)
      : []
  const fieldErrors: FieldErrors = {}

  for (const fieldError of serverFieldErrors) {
    const currentMessage = fieldErrors[fieldError.field]
    fieldErrors[fieldError.field] = currentMessage
      ? `${currentMessage}, ${fieldError.message}`
      : fieldError.message
  }

  const fieldErrorDetail = serverFieldErrors
    .map((fieldError) => fieldError.message)
    .filter((message) => message.length > 0)
    .join(', ')
  const kind = getKind(status, fieldErrors)
  const detail =
    serverDetail ??
    (fieldErrorDetail.length > 0 ? fieldErrorDetail : undefined) ??
    title ??
    (kind === 'network'
      ? uiText.apiErrors.networkDetail
      : uiText.apiErrors.fallbackDetail)

  return new AppError(
    status,
    title ??
      (kind === 'network'
        ? uiText.apiErrors.networkTitle
        : uiText.apiErrors.requestTitle),
    detail,
    fieldErrors,
    kind,
  )
}

export function throwApiError(body: unknown, status: number): never {
  throw parseApiError(body, status)
}

export function parseNetworkError(error: unknown): AppError | null {
  if (isAbortError(error)) {
    return null
  }

  if (error instanceof TypeError || hasErrorName(error, 'TimeoutError')) {
    return parseApiError(undefined, 0)
  }

  return null
}
