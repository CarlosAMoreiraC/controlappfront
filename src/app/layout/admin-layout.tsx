import { useState } from 'react'
import {
  ActionIcon,
  Avatar,
  Drawer,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  ChevronRight,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '@/auth'
import { filterMenuByRole } from '../navigation/menu'

interface NavigationProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function Navigation({ collapsed = false, onNavigate }: NavigationProps) {
  const { role } = useCurrentUser()
  const location = useLocation()
  const menuItems = filterMenuByRole(role)
  const activeMenuItem = menuItems
    .filter(
      (item) =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)),
    )
    .sort((left, right) => right.path.length - left.path.length)[0]

  return (
    <nav aria-label="Navegación principal" className="primary-navigation">
      <span className="navigation-caption">ESPACIO DE TRABAJO</span>
      {menuItems.map((item) => {
        const Icon = item.icon
        const active = activeMenuItem?.key === item.key
        const link = (
          <Link
            aria-current={active ? 'page' : undefined}
            className={`navigation-link${active ? ' is-active' : ''}`}
            key={item.key}
            onClick={onNavigate}
            to={item.path}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
            <span className="navigation-label">{item.label}</span>
            {active && <span className="navigation-indicator" />}
          </Link>
        )

        return collapsed ? (
          <Tooltip key={item.key} label={item.label} position="right">
            {link}
          </Tooltip>
        ) : (
          link
        )
      })}
    </nav>
  )
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { name, role } = useCurrentUser()
  const location = useLocation()
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)
  const activeItem = filterMenuByRole(role)
    .filter(
      (item) =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)),
    )
    .sort((left, right) => right.path.length - left.path.length)[0]
  const pageTitle = activeItem?.label ?? 'Inicio'

  return (
    <div className={`admin-shell${collapsed ? ' is-collapsed' : ''}`}>
      {!isMobile && (
        <aside className="desktop-sidebar">
          <Link aria-label="ControlApp, ir al inicio" className="brand" to="/">
            <span className="brand-mark">C</span>
            {!collapsed && (
              <span className="brand-name">
                Control<span>App</span>
              </span>
            )}
          </Link>

          <Navigation collapsed={collapsed} />

          <div className="sidebar-bottom">
            {!collapsed && (
              <div className="sidebar-role">
                <span className="role-dot" />
                <span>Perfil provisional</span>
              </div>
            )}
            <Tooltip
              disabled={!collapsed}
              label={collapsed ? 'Expandir menú' : 'Contraer menú'}
              position="right"
            >
              <ActionIcon
                aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
                className="collapse-button"
                onClick={() => setCollapsed((value) => !value)}
                size="lg"
                variant="subtle"
              >
                {collapsed ? (
                  <PanelLeftOpen size={19} />
                ) : (
                  <PanelLeftClose size={19} />
                )}
              </ActionIcon>
            </Tooltip>
          </div>
        </aside>
      )}

      <Drawer
        className="mobile-navigation-drawer"
        onClose={() => setMobileMenuOpen(false)}
        opened={isMobile && mobileMenuOpen}
        padding="md"
        position="left"
        size={280}
        title={
          <span className="brand brand-in-drawer">
            <span className="brand-mark">C</span>
            <span className="brand-name">
              Control<span>App</span>
            </span>
          </span>
        }
      >
        <Navigation onNavigate={() => setMobileMenuOpen(false)} />
      </Drawer>

      <div className="admin-main-column">
        <header className="topbar">
          <div className="topbar-leading">
            {isMobile && (
              <ActionIcon
                aria-label="Abrir menú"
                className="mobile-menu-button"
                onClick={() => setMobileMenuOpen(true)}
                size="lg"
                variant="subtle"
              >
                <MenuIcon size={21} />
              </ActionIcon>
            )}
            <div className="page-heading">
              <div className="breadcrumbs">
                <span>ControlApp</span>
                <ChevronRight size={13} />
                <span className="breadcrumb-current">{pageTitle}</span>
              </div>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="user-zone">
            <div className="user-copy">
              <strong>{name}</strong>
              <span>{role}</span>
            </div>
            <Avatar className="user-avatar" radius="xl" size={38}>
              AM
            </Avatar>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
