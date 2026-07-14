import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import { projects } from '../content/projects'

const spans = {
  large: 'md:col-span-4 md:row-span-2',
  wide: 'md:col-span-4 md:row-span-2',
  tall: 'md:col-span-2 md:row-span-2',
  standard: 'md:col-span-2 md:row-span-1',
}

export default function Projects() {
  const reduce = useReducedMotion()

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

  return (
    <PageTransition>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            01 — Selected work
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
        </Reveal>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          className="mt-14 grid auto-rows-[16rem] grid-cols-1 gap-4 md:auto-rows-[10.5rem] md:grid-cols-6"
        >
          {projects.map((project) => (
            <motion.article
              key={project.slug}
              variants={card}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`group relative overflow-hidden border border-line bg-surface transition-colors duration-200 hover:border-accent/70 ${
                spans[project.span] ?? spans.standard
              }`}
            >
              <Link to={`/projects/${project.slug}`} className="flex h-full flex-col">
                <div className="relative flex-1 overflow-hidden">
                  {project.cover?.svg ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 p-4 text-ink opacity-60 transition-opacity duration-300 group-hover:opacity-100 [&_svg]:h-full [&_svg]:w-full"
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
                <footer className="border-t border-line px-4 py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-medium">{project.title}</h2>
                    <span className="font-mono text-[11px] tracking-[0.15em] text-muted">
                      {project.year}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                    {project.architect}
                  </p>
                </footer>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </main>
    </PageTransition>
  )
}
