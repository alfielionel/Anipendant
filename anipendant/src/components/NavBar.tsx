import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function NavBar() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/browse" className="navbar-logo">
          Anipendant
        </NavLink>
      </div>

      <div className="navbar-links">
        <NavLink to="/browse" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Browse
        </NavLink>
        <NavLink to="/shows" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Shows
        </NavLink>
      </div>

      <div className="navbar-actions">
        <NavLink to="/account" className="nav-link username-link">
          {user.username}
        </NavLink>
      </div>
    </nav>
  )
}
