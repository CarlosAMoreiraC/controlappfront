export const roles = [
  'ADMIN',
  'SUPERVISOR',
  'OPERATOR',
  'SALES_REP',
  'DRIVER',
] as const

export type Role = (typeof roles)[number]

export interface CurrentUser {
  id: string
  name: string
  role: Role
}
