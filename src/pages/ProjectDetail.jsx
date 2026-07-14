import { Link, Navigate, useParams } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import { projects, getProject } from '../content/projects'

function Drawing({ label, svg, url }) {
  return (
    <figure className="border border-line">
      {svg ? (
        <div
          className="p-6 text-ink [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-h-[440px] [&_svg]:w-full [&_svg]:max-w-full sm:p-8"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <img src={url} alt={label} loading="lazy" className="h-auto w-full" />
      )}
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </figcaption>
    </figure>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <Navigate to="/projects" replace />

  const index = projects.indexOf(project)
  const prev = projects[index - 1]
  const next = projects[index + 1]

  const meta = [
    ['Architect', project.architect],
    ['Year', project.year],
    ['Location', project.location],
    ['Status', project.status],
  ].filter(([, v]) => v)

  return (
    <PageTransition>
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <Link
              to="/projects"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
            >
              ← Index
            </Link>
            <span className="font-mono text-xs tracking-[0.2em] text-muted">
              {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
          </div>

          <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_280px]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-5 text-lg leading-relaxed text-ink/85">{project.description}</p>
              )}
              <div className="mt-6 space-y-5 leading-relaxed text-ink/85">
                {(project.body ?? []).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </div>

            <dl className="h-fit border-t border-line">
              {meta.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {key}
                  </dt>
                  <dd className="text-right text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {project.cover && (
          <Reveal className="mt-16">
            <Drawing label="Cover" svg={project.cover.svg} url={project.cover.url} />
          </Reveal>
        )}

        {project.drawings.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {project.drawings.map((d, i) => (
              <Reveal key={d.file} delay={i * 0.05}>
                <Drawing label={d.label} svg={d.svg} url={d.url} />
              </Reveal>
            ))}
          </div>
        )}

        {project.photos.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {project.photos.map((photo, i) => (
              <Reveal key={photo.url} delay={i * 0.05}>
                <figure className="border border-line">
                  <img src={photo.url} alt={`${project.title} — ${photo.label}`} className="w-full" />
                  <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {photo.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        <nav className="mt-20 flex items-baseline justify-between gap-6 border-t border-line pt-8">
          {prev ? (
            <Link
              to={`/projects/${prev.slug}`}
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-accent"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/projects/${next.slug}`}
              className="text-right font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-accent"
            >
              {next.title} →
            </Link>
          )}
        </nav>
      </main>
    </PageTransition>
  )
}
