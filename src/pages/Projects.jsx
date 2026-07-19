import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import { projects } from '../content/projects'

const allTags = [...new Set(projects.flatMap((p) => p.tags ?? []))].sort()

export default function Projects() {
  const reduce = useReducedMotion()
  const [activeTag, setActiveTag] = useState(null)

  const shown = activeTag ? projects.filter((p) => (p.tags ?? []).includes(activeTag)) : projects

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

  const filterClass = (isActive) =>
    `font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
      isActive ? 'border-b border-accent pb-0.5 text-ink' : 'text-muted hover:text-accent'
    }`

  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Reveal>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <button type="button" onClick={() => setActiveTag(null)} className={filterClass(!activeTag)}>
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={filterClass(tag === activeTag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div
          key={activeTag ?? 'all'}
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
              className="group relative overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-200 hover:border-accent/70"
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
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                      {(project.tags ?? []).join(' · ')}
                    </p>
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
