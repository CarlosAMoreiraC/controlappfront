import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useCurrentUser } from '@/auth'
import type { MenuKey } from './navigation/menu'
import { filterMenuByRole } from './navigation/menu'
import AdminLayout from './layout/admin-layout'

const HomePage = lazy(() => import('./pages/home-page'))
const SitesPage = lazy(() =>
  import('@/features/organization').then((module) => ({
    default: module.SitesPage,
  })),
)
const WarehousesPage = lazy(() =>
  import('@/features/organization').then((module) => ({
    default: module.WarehousesPage,
  })),
)
const CustomersPage = lazy(() =>
  import('@/features/customers').then((module) => ({
    default: module.CustomersPage,
  })),
)
const CustomerTypesPage = lazy(() =>
  import('@/features/customers').then((module) => ({
    default: module.CustomerTypesPage,
  })),
)
const ProductsPage = lazy(() =>
  import('@/features/catalog').then((module) => ({
    default: module.ProductsPage,
  })),
)
const PriceListsPage = lazy(() =>
  import('@/features/catalog').then((module) => ({
    default: module.PriceListsPage,
  })),
)
const PriceListItemsPage = lazy(() =>
  import('@/features/catalog').then((module) => ({
    default: module.PriceListItemsPage,
  })),
)

const pages = {
  home: HomePage,
  sites: SitesPage,
  warehouses: WarehousesPage,
  customers: CustomersPage,
  customerTypes: CustomerTypesPage,
  products: ProductsPage,
  priceLists: PriceListsPage,
} satisfies Record<MenuKey, LazyExoticComponent<ComponentType>>

function RouteLoading() {
  return <div className="route-loading">Cargando sección...</div>
}

function AppRouter() {
  const { role } = useCurrentUser()
  const allowedItems = filterMenuByRole(role)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          {allowedItems.map((item) => {
            const Page = pages[item.key]

            return (
              <Route
                key={item.key}
                path={item.path}
                element={
                  <Suspense fallback={<RouteLoading />}>
                    <Page />
                  </Suspense>
                }
              />
            )
          })}
          {allowedItems.some((item) => item.key === 'priceLists') && (
            <Route
              path="/catalog/price-lists/:priceListId/items"
              element={
                <Suspense fallback={<RouteLoading />}>
                  <PriceListItemsPage />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
