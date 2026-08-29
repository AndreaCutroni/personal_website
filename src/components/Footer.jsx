const links = [
  { label: 'Email', href: 'mailto:andrea.cutroni.eng@gmail.com' },
  { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/andrea-cutroni/' },
  { label: 'GitHub ↗', href: 'https://github.com/AndreaCutroni' },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-ground">
      {/* Full bleed to match the header: copyright holds the left corner and the
          links the right, at any width. */}
      <div className="flex flex-col gap-4 px-6 py-8 md:px-12 xl:px-24 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          © {new Date().getFullYear()} Andrea Cutroni
        </p>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
