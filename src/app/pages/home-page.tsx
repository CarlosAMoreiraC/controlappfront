import { ArrowUpRight, Compass } from 'lucide-react'
import { Link } from 'react-router'
import { useCurrentUser } from '@/auth'
import { filterMenuByRole } from '../navigation/menu'

function HomePage() {
  const user = useCurrentUser()
  const quickLinks = filterMenuByRole(user.role).filter(
    (item) => item.key !== 'home',
  )

  return (
    <div className="home-page">
      <section className="welcome-band">
        <div className="welcome-copy">
          <span className="section-kicker">PANEL DE OPERACIONES</span>
          <h2>Hola, {user.name}</h2>
          <p>Tu espacio de administración está listo.</p>
        </div>
        <div className="welcome-mark" aria-hidden="true">
          <Compass size={34} strokeWidth={1.4} />
          <span />
        </div>
      </section>

      <section className="quick-access" aria-labelledby="quick-access-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">GESTIÓN</span>
            <h2 id="quick-access-title">Accesos directos</h2>
          </div>
          <span className="section-count">
            {String(quickLinks.length).padStart(2, '0')} secciones
          </span>
        </div>

        <div className="quick-link-list">
          {quickLinks.map((item, index) => {
            const Icon = item.icon

            return (
              <Link className="quick-link" key={item.key} to={item.path}>
                <span className={`quick-link-icon quick-link-icon-${index}`}>
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="quick-link-label">
                  <strong>{item.label}</strong>
                  <small>
                    {item.key === 'customers' ? 'Cartera' : 'Organización'}
                  </small>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      </section>

      <footer className="home-footer">
        <span className="status-dot" />
        <span>Sesión temporal</span>
        <span className="footer-divider">·</span>
        <span>Rol {user.role}</span>
      </footer>
    </div>
  )
}

export default HomePage
