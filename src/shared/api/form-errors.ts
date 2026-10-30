import type { FieldErrors } from './errors'

export const FORM_ERROR_KEY = '_form'

export function mapFieldErrorsToForm(
  values: object,
  fieldErrors: FieldErrors,
): Record<string, string> {
  const knownFields = new Set(Object.keys(values))
  const mappedErrors: Record<string, string> = {}
  const unknownMessages: string[] = []

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (knownFields.has(field)) {
      mappedErrors[field] = message
    } else {
      unknownMessages.push(message)
    }
  }

  if (unknownMessages.length > 0) {
    mappedErrors[FORM_ERROR_KEY] = unknownMessages.join(', ')
  }

  return mappedErrors
}
