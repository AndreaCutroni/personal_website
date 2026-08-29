import { useId, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import Collapsible, { Chevron } from '../components/Collapsible'
import CenterCarousel from '../components/CenterCarousel'
import WorkflowDiagram from '../components/project/WorkflowDiagram'
import FlowDiagram from '../components/project/FlowDiagram'
import MetricRow from '../components/project/MetricRow'
import StoryPlayer from '../components/project/StoryPlayer'
import ImageGrid from '../components/project/ImageGrid'
import BeforeAfter from '../components/project/BeforeAfter'
import LoopVideo from '../components/project/LoopVideo'
import { projects, getProject, categoryOf } from '../content/projects'

/* One dossier section: heading, chevron, and everything under it collapsing
   together — the same toggle used on the About timeline. */
function ProjectSection({ section, workflow, flow, images, scenes, pairs }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <>
      {/* The heading itself is the control, so the title text toggles the
          section. Button inside the h2 rather than around it, so the heading
          keeps its semantics in the document outline. */}
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          /* Tailwind v4 preflight resets text-transform and cursor on button,
             so both have to be restated to keep the heading's own styling. */
          className="inline-flex cursor-pointer items-center gap-3 text-left uppercase transition-colors duration-200 hover:text-accent"
        >
          <span>
            <span className="text-accent">{section.index}</span> — {section.title}
          </span>
          <Chevron open={open} />
        </button>
      </h2>

      {/* The gap under the heading lives inside the collapsing region, so a
          closed section leaves nothing but its own heading behind. */}
      <Collapsible open={open} id={panelId} className="pt-6">
        {(section.body ?? []).length > 0 && (
          <div className="mb-8 max-w-2xl space-y-5 leading-relaxed text-ink/85">
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* A diagram normally lives at the top of meta.json, since most projects
            draw only one. A section can carry its own instead, for the sheets
            that draw two. */}
        {section.block === 'workflow' && <WorkflowDiagram {...(section.workflow ?? workflow)} />}

        {section.block === 'flow' && (
          <>
            <FlowDiagram {...(section.flow ?? flow)} />
            {images.length > 0 && (
              <div className="mt-8">
                <ImageGrid
                  items={images}
                  columns={section.columns ?? 1}
                  layout={section.layout}
                  captions={section.captions !== false}
                />
              </div>
            )}
          </>
        )}

        {section.block === 'metrics' && (
          <>
            <MetricRow metrics={section.metrics} />
            <div className="mt-8">
              {section.story ? (
                <StoryPlayer scenes={scenes} aspect={section.aspect} />
              ) : (
                <ImageGrid
                  items={images}
                  columns={section.columns ?? 2}
                  layout={section.layout}
                  captions={section.captions !== false}
                />
              )}
            </div>
          </>
        )}

        {section.block === 'story' && <StoryPlayer scenes={scenes} aspect={section.aspect} />}

        {section.block === 'compare' && (
          <BeforeAfter
            pairs={pairs}
            beforeLabel={section.beforeLabel}
            afterLabel={section.afterLabel}
          />
        )}

        {section.block === 'grid' && (
          <ImageGrid
            items={images}
            columns={section.columns ?? 2}
            layout={section.layout}
            captions={section.captions !== false}
          />
        )}

        {section.block === 'pending' && (
          <p className="rounded-lg border border-dashed border-line px-5 py-6 text-sm text-muted">
            {section.note}
          </p>
        )}
      </Collapsible>
    </>
  )
}

function Drawing({ label, svg, url, video, showLabel = true, aspect }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-surface">
      {video ? (
        /* Silent, looping, no controls — this is a hero, not a player. The
           still is the poster so the frame is never empty while it loads, and
           a hairline on the bottom edge carries the position in the loop. */
        <LoopVideo src={video} poster={url} label={label} aspect={aspect} />
      ) : svg ? (
        <div
          className="p-6 text-ink [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-h-[440px] [&_svg]:w-full [&_svg]:max-w-full sm:p-8"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <img
          src={url}
          alt={label}
          loading="lazy"
          style={aspect ? { aspectRatio: aspect } : undefined}
          className={aspect ? 'w-full object-cover' : 'h-auto w-full'}
        />
      )}
      {showLabel && (
        <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {label}
        </figcaption>
      )}
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

  /* Sections are declared in meta.json and reference drawings by filename;
     resolve those names against the globbed modules here. A project without
     sections keeps the original single-carousel layout. */
  const sections = project.sections ?? []
  const byName = new Map(media.map((m) => [m.file.split('/').pop(), m]))
  const resolve = (entries) =>
    (entries ?? [])
      .map((entry) => {
        const match = byName.get(entry.file)
        return match ? { ...entry, url: match.url, svg: match.svg, label: match.label } : null
      })
      .filter(Boolean)

  /* A comparison names two drawings rather than one; a pair missing either half
     is dropped, the same way a missing image is. */
  const resolvePairs = (entries) =>
    (entries ?? [])
      .map((entry) => ({
        ...entry,
        before: byName.get(entry.before)?.url,
        after: byName.get(entry.after)?.url,
      }))
      .filter((entry) => entry.before && entry.after)

  const category = categoryOf(project.palette)

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
      {/* Full bleed on the same gutter as the header, so the rail lines up under
          the wordmark. Prose is capped separately below — only the drawings
          should take the extra width. */}
      <main
        data-palette={project.palette}
        className="px-6 pb-24 pt-32 md:px-12 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12 xl:px-24"
      >
        {/* All projects as a vertically scrolling rail of small cards. */}
        <aside className="hidden lg:block">
          <div className="project-rail sticky top-28 flex max-h-[calc(100svh-9rem)] flex-col gap-4 overflow-y-auto pr-1">
            {projects.map((p) => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                aria-current={p.slug === project.slug ? 'page' : undefined}
                /* Each card carries its own palette, so the border reads as
                   that project's category rather than the one being viewed. */
                data-palette={p.palette}
                className={`group block shrink-0 overflow-hidden rounded-md border bg-surface transition-colors duration-200 ${
                  p.slug === project.slug
                    ? 'border-accent-mark'
                    : 'border-accent-mark/35 hover:border-accent-mark/70'
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

        {/* The rail stays out on the page gutter, aligned with the wordmark,
            while the content holds a readable width and centres on the screen.
            The margin is measured against this grid track rather than the
            viewport, so it is exact — vw would count the scrollbar and land
            the content a few pixels off. It clamps to 0 on narrower screens,
            where centring would drive the content under the rail. */}
        <div className="min-w-0 max-w-[1100px] xl:ml-[max(0px,calc(50%-674px))]">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/projects"
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
            >
              ← All projects
            </Link>
            {category && (
              <Link
                to={`/projects?category=${category.id}`}
                className="rounded-full border border-accent-mark px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent transition-colors duration-200 hover:bg-accent-mark hover:text-ink"
              >
                {category.label}
              </Link>
            )}
            {project.sheets && (
              /* No download attribute: this opens the browser's PDF viewer, so
                 the sheets can be read first and saved from there if wanted. */
              <a
                href={project.sheets}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-accent"
              >
                Portfolio sheets ↗
              </a>
            )}
          </div>

          <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            {/* Measure held at ~62 characters however wide the page gets — the
                container grew for the drawings, not for the prose. */}
            <div className="max-w-[62ch]">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              {(project.tags ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Labels, not controls — the category button above is what
                      leads back to a filtered index. */}
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-mark/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-accent"
                    >
                      {tag}
                    </span>
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

            <div className="h-fit lg:sticky lg:top-28">
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
              {/* Tools, not themes: bordered rather than filled, so they read as
                  data next to the amber tag pills that link into the filter. */}
              {(project.stack ?? []).length > 0 && (
                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    Stack
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/80"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
            {/* Cropped to a band: covers vary from square to panoramic, and a
                full-height square hero pushes the whole dossier below the fold. */}
            <Drawing
              label={project.title}
              svg={project.cover.svg}
              url={project.cover.url}
              video={project.cover.video}
              showLabel={false}
              aspect="16 / 9"
            />
          </Reveal>
        )}

        {/* Declared at the top of meta.json rather than as a section: this sits
            under the cover, open, as part of the introduction. */}
        {project.compare && (
          <Reveal className="mt-6">
            <BeforeAfter
              pairs={resolvePairs(project.compare.pairs)}
              beforeLabel={project.compare.beforeLabel}
              afterLabel={project.compare.afterLabel}
            />
          </Reveal>
        )}

        {/* Also outside the sections: a strip of media that belongs with the
            cover rather than under any one heading. */}
        {project.gallery && (
          <Reveal className="mt-6">
            <ImageGrid
              items={resolve(project.gallery.images)}
              columns={project.gallery.columns ?? 3}
              layout={project.gallery.layout}
              captions={project.gallery.captions !== false}
            />
          </Reveal>
        )}

        {sections.map((section) => (
          <Reveal key={section.index} className="mt-10">
            <ProjectSection
              section={section}
              workflow={project.workflow}
              flow={project.flow}
              images={resolve(section.images)}
              scenes={resolve(section.scenes)}
              pairs={resolvePairs(section.pairs)}
            />
          </Reveal>
        ))}

        {sections.length === 0 && media.length > 0 && (
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
                    {project.captions !== false && (
                      <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                        {item.label}
                      </figcaption>
                    )}
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
