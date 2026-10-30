import type { CurrentUser } from '../types'

const temporaryUser: CurrentUser = {
  id: 'temporary-admin',
  name: 'Fray',
  role: 'ADMIN',
}

// TEMPORARY: replace with the authenticated user when login is implemented.
export function useCurrentUser(): CurrentUser {
  return temporaryUser
}
