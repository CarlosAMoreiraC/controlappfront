import { describe, expect, it } from 'vitest'
import { uiText } from '@/shared/i18n/texts'
import { isAbortError, parseApiError, parseNetworkError } from './errors'

describe('parseApiError', () => {
  it('preserves detail from ErrorResponse', () => {
    const error = parseApiError(
      {
        title: 'Conflict',
        status: 409,
        detail: 'Site name already exists exactly as sent',
      },
      409,
    )

    expect(error.title).toBe('Conflict')
    expect(error.detail).toBe('Site name already exists exactly as sent')
    expect(error.status).toBe(409)
    expect(error.kind).toBe('conflict')
    expect(error.fieldErrors).toEqual({})
  })

  it('maps ErrorResponse field errors for forms', () => {
    const error = parseApiError(
      {
        title: 'Validation error',
        status: 400,
        errors: [
          { field: 'name', message: 'must not be blank' },
          { field: 'active', message: 'must be true' },
        ],
      },
      400,
    )

    expect(error.detail).toBe('must not be blank, must be true')
    expect(error.kind).toBe('validation')
    expect(error.fieldErrors).toEqual({
      name: 'must not be blank',
      active: 'must be true',
    })
  })

  it('uses the ProblemDetail title when detail is absent', () => {
    const error = parseApiError({ title: 'Product not found' }, 404)

    expect(error.title).toBe('Product not found')
    expect(error.detail).toBe('Product not found')
    expect(error.kind).toBe('not_found')
  })

  it('uses the title when ErrorResponse detail is null', () => {
    const error = parseApiError(
      { title: 'Validation failed', status: 400, detail: null },
      400,
    )

    expect(error.detail).toBe('Validation failed')
    expect(error.kind).toBe('validation')
  })

  it('ignores an empty ErrorResponse errors array', () => {
    const error = parseApiError(
      { title: 'Validation failed', status: 400, errors: [] },
      400,
    )

    expect(error.detail).toBe('Validation failed')
    expect(error.fieldErrors).toEqual({})
  })

  it('ignores malformed items in ErrorResponse errors', () => {
    const error = parseApiError(
      {
        title: 'Validation failed',
        status: 400,
        errors: [
          null,
          'not a field error',
          { field: 12, message: 'invalid field name' },
          { field: 'name', message: 42 },
        ],
      },
      400,
    )

    expect(error.detail).toBe('Validation failed')
    expect(error.fieldErrors).toEqual({})
  })

  it('joins multiple server messages for the same field', () => {
    const error = parseApiError(
      {
        title: 'Validation failed',
        status: 400,
        errors: [
          { field: 'name', message: 'must not be blank' },
          { field: 'name', message: 'must be unique' },
        ],
      },
      400,
    )

    expect(error.fieldErrors).toEqual({
      name: 'must not be blank, must be unique',
    })
    expect(error.detail).toBe('must not be blank, must be unique')
  })

  it('classifies 401 and 403 authorization responses', () => {
    expect(parseApiError({ title: 'Unauthorized' }, 401).kind).toBe(
      'unauthorized',
    )
    expect(parseApiError({ title: 'Forbidden' }, 403).kind).toBe('forbidden')
  })

  it('uses a Spanish fallback for an HTTP response without JSON', () => {
    const error = parseApiError(undefined, 502)

    expect(error.title).toBe(uiText.apiErrors.requestTitle)
    expect(error.detail).toBe(uiText.apiErrors.fallbackDetail)
    expect(error.kind).toBe('server')
  })

  it('classifies TypeError network failures', () => {
    const error = parseNetworkError(new TypeError('fetch failed'))

    expect(error?.title).toBe(uiText.apiErrors.networkTitle)
    expect(error?.detail).toBe(uiText.apiErrors.networkDetail)
    expect(error?.kind).toBe('network')
  })

  it('classifies TimeoutError as a network failure', () => {
    const error = parseNetworkError(
      new DOMException('The operation timed out', 'TimeoutError'),
    )

    expect(error?.kind).toBe('network')
    expect(error?.detail).toBe(uiText.apiErrors.networkDetail)
  })

  it('does not convert AbortError to an AppError', () => {
    const abortError = new DOMException('Request cancelled', 'AbortError')

    expect(isAbortError(abortError)).toBe(true)
    expect(parseNetworkError(abortError)).toBeNull()
  })

  it('does not treat TimeoutError as an AbortError', () => {
    expect(
      isAbortError(new DOMException('Request timed out', 'TimeoutError')),
    ).toBe(false)
  })
})
