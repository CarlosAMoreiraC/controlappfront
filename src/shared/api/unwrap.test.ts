import { describe, expect, it } from 'vitest'
import { AppError } from './errors'
import { unwrap } from './unwrap'

describe('unwrap', () => {
  it('returns data when the OpenAPI call succeeds', () => {
    const response = new Response(JSON.stringify({ value: 7 }), { status: 200 })

    expect(unwrap({ data: { value: 7 }, response })).toEqual({ value: 7 })
  })

  it('throws AppError when the OpenAPI result contains an error', () => {
    const response = new Response(null, { status: 404 })

    expect(() =>
      unwrap({
        error: { title: 'Not found', status: 404, detail: 'Missing item' },
        response,
      }),
    ).toThrow(AppError)
  })

  it('accepts a 204 response without a body', () => {
    const response = new Response(null, { status: 204 })

    expect(unwrap({ response })).toBeUndefined()
  })

  it('throws AppError when a body-bearing response has no data', () => {
    const response = new Response(null, { status: 200 })

    expect(() => unwrap({ response })).toThrow(AppError)
  })
})
