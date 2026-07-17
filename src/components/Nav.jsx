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
      className={`fixed inset-x-0 top-0 z-20 ${isHome ? '' : 'border-b border-line bg-ground'}`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="group flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink"
        >
          <LogoMark className="h-7 w-auto" />
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
            className="text-muted transition-colors duration-200 hover:text-accent"
          >
            {theme === 'dark' ? (
              /* Sun: click to switch to light mode. */
              <svg
                viewBox="0 0 20 20"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="3.8" />
                <path d="M10 1.5v2.2M10 16.3v2.2M18.5 10h-2.2M3.7 10H1.5M16 4l-1.55 1.55M5.55 14.45 4 16M16 16l-1.55-1.55M5.55 5.55 4 4" />
              </svg>
            ) : (
              /* Moon: click to switch to dark mode. */
              <svg
                viewBox="0 0 20 20"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
