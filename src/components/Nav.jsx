import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import LogoMark from './LogoMark'

const linkClass = ({ isActive }) =>
  `font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
    isActive ? 'text-ink border-b border-accent pb-0.5' : 'text-muted hover:text-accent'
  }`

export default function Nav() {
  const isHome = useLocation().pathname === '/'
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <header
      className={`inset-x-0 top-0 z-20 ${
        isHome ? 'absolute' : 'fixed border-b border-line bg-ground'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="group flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink"
        >
          <LogoMark className="h-6 w-6" />
          <span className="hidden transition-colors duration-200 group-hover:text-accent sm:inline">
            Andrea_Cutroni
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <NavLink to="/projects" className={linkClass}>
            Projects
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-accent"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>
    </header>
  )
}
