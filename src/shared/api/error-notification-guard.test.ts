import { describe, expect, it } from 'vitest'
import { AppError } from './errors'
import { shouldShowAppErrorNotification } from './error-notification-guard'

describe('shouldShowAppErrorNotification', () => {
  it('suppresses duplicate errors during the dedupe window', () => {
    const error = new AppError(
      503,
      'Server error',
      'Repeated test',
      {},
      'server',
    )

    expect(shouldShowAppErrorNotification(error, 10_000)).toBe(true)
    expect(shouldShowAppErrorNotification(error, 12_000)).toBe(false)
    expect(shouldShowAppErrorNotification(error, 16_000)).toBe(true)
  })

  it('keeps different statuses distinct', () => {
    const clientError = new AppError(
      404,
      'Not found',
      'Distinct test',
      {},
      'not_found',
    )
    const serverError = new AppError(
      500,
      'Server',
      'Distinct test',
      {},
      'server',
    )

    expect(shouldShowAppErrorNotification(clientError, 20_000)).toBe(true)
    expect(shouldShowAppErrorNotification(serverError, 20_000)).toBe(true)
  })
})
