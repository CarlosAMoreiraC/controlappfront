import {
  Building2,
  House,
  ListChecks,
  Package,
  Tags,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/auth'

export type MenuKey =
  | 'home'
  | 'sites'
  | 'warehouses'
  | 'customers'
  | 'customerTypes'
  | 'products'
  | 'priceLists'

export interface MenuItem {
  key: MenuKey
  label: string
  path: string
  icon: LucideIcon
  roles: Role[]
}

const allRoles: Role[] = [
  'ADMIN',
  'SUPERVISOR',
  'OPERATOR',
  'SALES_REP',
  'DRIVER',
]
const managementRoles: Role[] = ['ADMIN', 'SUPERVISOR']

// Hiding menu entries is only a UI convenience; authorization belongs to the backend.
export const menuItems: MenuItem[] = [
  {
    key: 'home',
    label: 'Inicio',
    path: '/',
    icon: House,
    roles: allRoles,
  },
  {
    key: 'sites',
    label: 'Sedes',
    path: '/organization/sites',
    icon: Building2,
    roles: managementRoles,
  },
  {
    key: 'warehouses',
    label: 'Bodegas',
    path: '/organization/warehouses',
    icon: Warehouse,
    roles: managementRoles,
  },
  {
    key: 'customers',
    label: 'Clientes',
    path: '/customers',
    icon: UsersRound,
    roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
  },
  {
    key: 'customerTypes',
    label: 'Tipos de cliente',
    path: '/customers/types',
    icon: Tags,
    roles: ['ADMIN'],
  },
  {
    key: 'products',
    label: 'Productos',
    path: '/catalog/products',
    icon: Package,
    roles: managementRoles,
  },
  {
    key: 'priceLists',
    label: 'Listas de precios',
    path: '/catalog/price-lists',
    icon: ListChecks,
    roles: managementRoles,
  },
]

export function filterMenuByRole(role: Role): MenuItem[] {
  return menuItems.filter((item) => item.roles.includes(role))
}
