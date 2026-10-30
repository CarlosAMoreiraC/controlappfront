import { describe, expect, it } from 'vitest'
import { FORM_ERROR_KEY, mapFieldErrorsToForm } from './form-errors'

describe('mapFieldErrorsToForm', () => {
  it('maps known fields and sends unknown fields to the general form error', () => {
    const errors = mapFieldErrorsToForm(
      { name: '', active: true },
      {
        name: 'El nombre no es válido.',
        backendRule: 'El registro ya está asociado.',
      },
    )

    expect(errors).toEqual({
      name: 'El nombre no es válido.',
      [FORM_ERROR_KEY]: 'El registro ya está asociado.',
    })
  })
})
