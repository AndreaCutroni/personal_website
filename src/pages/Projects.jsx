import { motion, useReducedMotion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import { projects, categories } from '../content/projects'

export default function Projects() {
  const reduce = useReducedMotion()

  /* The filter lives in the URL, so a project page can link straight to its
     own category and the choice survives a reload or a shared link. */
  const [params, setParams] = useSearchParams()
  const requested = params.get('category')
  const activeCategory = categories.some((c) => c.id === requested) ? requested : null
  const setActiveCategory = (id) => setParams(id ? { category: id } : {}, { replace: true })

  const shown = activeCategory
    ? projects.filter((p) => p.palette === activeCategory)
    : projects

  const grid = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  }
  const card = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.34, ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  /* Sized to keep all four on one line at the container width; below that the
     row scrolls sideways rather than wrapping. */
  const filterClass = (isActive) =>
    `shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-accent-mark hover:text-ink hover:border-accent-mark ${
      isActive
        ? 'border-accent-mark bg-accent-mark text-ink'
        : 'border-line text-muted'
    }`

  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
            {/* Lives in public/ rather than the bundle, so it keeps a stable,
                shareable URL and a filename worth saving. No download
                attribute: it opens in the browser's PDF viewer first. */}
            <a
              href="/Andrea-Cutroni-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
            >
              Full portfolio ↗
            </a>
          </div>

          <div className="mt-8 -mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={filterClass(!activeCategory)}
            >
              All
            </button>
            {categories.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id === activeCategory ? null : id)}
                className={filterClass(id === activeCategory)}
              >
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div
          key={activeCategory ?? 'all'}
          variants={grid}
          initial="hidden"
          animate="show"
          className="mt-12 grid grid-cols-1 gap-8"
        >
          {shown.map((project) => (
            <motion.article
              key={project.slug}
              variants={card}
              layout
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="group relative overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-200 hover:border-accent-mark/70"
            >
              <Link to={`/projects/${project.slug}`} className="flex flex-col">
                <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                  {project.cover?.svg ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 p-6 text-ink opacity-60 transition-opacity duration-300 group-hover:opacity-100 [&_svg]:h-full [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: project.cover.svg }}
                    />
                  ) : project.cover?.url ? (
                    <img
                      src={project.cover.url}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  ) : null}
                </div>
                <footer className="border-t border-line px-5 py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-lg font-medium">{project.title}</h2>
                    <span className="font-mono text-[11px] tracking-[0.15em] text-muted">
                      {project.year}
                    </span>
                  </div>
                  {(project.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          /* Labels, not controls — the three category pills
                             above do the filtering, so these stay put on hover. */
                          className="rounded-full bg-accent-mark/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </footer>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </main>
    </PageTransition>
  )
}
