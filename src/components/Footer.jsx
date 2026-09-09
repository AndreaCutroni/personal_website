import { Link } from 'react-router-dom'

/* Monochrome throughout — fill/stroke both read currentColor, so each icon
   just follows the link's own text-muted/hover:text-accent, the same as
   every other mark on the site rather than picking up brand colour. */
function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576 4.765-1.588 8.199-6.085 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

const links = [
  { label: 'Email', href: 'mailto:andrea.cutroni.eng@gmail.com', Icon: EmailIcon },
  { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/andrea-cutroni/', Icon: LinkedInIcon },
  { label: 'GitHub ↗', href: 'https://github.com/AndreaCutroni', Icon: GitHubIcon },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-ground">
      {/* Full bleed to match the header: copyright holds the left corner and the
          links the right, at any width. h-16 from sm mirrors the header's own
          fixed height exactly; below that the two lines still need to stack,
          so height stays intrinsic (py-8) rather than fixed. */}
      <div className="flex flex-col gap-4 px-6 py-8 md:px-12 xl:px-24 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {/* The name is the way into the credits/rights page — a quiet
              footnote link rather than a nav item, for anyone who goes
              looking rather than everyone browsing. */}
          © {new Date().getFullYear()}{' '}
          <Link to="/credits" className="transition-colors duration-200 hover:text-accent">
            Andrea Cutroni
          </Link>
        </p>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {links.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-accent"
            >
              <Icon />
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
