import { Link, Navigate, useParams } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import CenterCarousel from '../components/CenterCarousel'
import { projects, getProject } from '../content/projects'

function Drawing({ label, svg, url }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-surface">
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
  const media = [...project.drawings, ...project.photos]

  const meta = [
    ['Team', project.team],
    ['Architect', project.architect],
    ['Program', project.program],
    ['Year', project.year],
    ['Location', project.location],
    ['Status', project.status],
  ].filter(([, v]) => v)

  return (
    <PageTransition>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        {/* All projects as a vertically scrolling rail of small cards. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 flex max-h-[calc(100svh-9rem)] flex-col gap-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {projects.map((p) => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                aria-current={p.slug === project.slug ? 'page' : undefined}
                className={`group block shrink-0 overflow-hidden rounded-md border bg-surface transition-colors duration-200 ${
                  p.slug === project.slug
                    ? 'border-accent'
                    : 'border-line hover:border-accent/60'
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {p.cover?.svg ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 p-2 text-ink opacity-70 transition-opacity duration-200 group-hover:opacity-100 [&_svg]:h-full [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: p.cover.svg }}
                    />
                  ) : p.cover?.url ? (
                    <img
                      src={p.cover.url}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
                        p.slug === project.slug ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    />
                  ) : null}
                </div>
                <p
                  className={`truncate px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-200 ${
                    p.slug === project.slug ? 'text-ink' : 'text-muted group-hover:text-ink'
                  }`}
                >
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
        <Reveal>
          <Link
            to="/projects"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
          >
            ← Index
          </Link>

          <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_280px]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              {(project.tags ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Link
                      key={tag}
                      to="/projects"
                      className="rounded-full bg-accent-mark/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-accent transition-colors duration-200 hover:bg-accent-mark/35"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              {project.description && (
                <p className="mt-5 text-lg leading-relaxed text-ink/85">{project.description}</p>
              )}
              <div className="mt-6 space-y-5 leading-relaxed text-ink/85">
                {(project.body ?? []).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="h-fit">
              <dl className="border-t border-line">
                {meta.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 border-b border-line py-3">
                    <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {key}
                    </dt>
                    <dd className="text-right text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
                >
                  Published on IAAC Blog ↗
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {project.cover && (
          <Reveal className="mt-16">
            <Drawing label="Cover" svg={project.cover.svg} url={project.cover.url} />
          </Reveal>
        )}

        {media.length > 0 && (
          <Reveal className="mt-4">
            <CenterCarousel
              itemClassName="w-[80vw] sm:w-[520px]"
              maxScale={1.18}
              minScale={0.82}
              falloff={0.3}
              items={media.map((item) => ({
                key: item.file,
                node: (
                  <figure className="overflow-hidden rounded-lg border border-line bg-surface">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden">
                      {item.svg ? (
                        <div
                          className="h-full w-full p-6 text-ink [&_svg]:h-full [&_svg]:w-full"
                          dangerouslySetInnerHTML={{ __html: item.svg }}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`${project.title} — ${item.label}`}
                          loading="lazy"
                          draggable={false}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {item.label}
                    </figcaption>
                  </figure>
                ),
              }))}
            />
          </Reveal>
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
        </div>
      </main>
    </PageTransition>
  )
}
