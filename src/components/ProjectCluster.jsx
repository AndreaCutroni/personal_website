import { Link } from 'react-router-dom'
import { projects } from '../content/projects'

// watchOS-style cluster: circular "portholes" holding each project's cover
// drawing, arranged as a pentagon around a hub that links to the full index.
// Positions and sizes are percentages of a square container, so the whole
// cluster scales fluidly with the viewport.
const RING = [
  { x: 50, y: 15, s: 27 },
  { x: 82.5, y: 39.5, s: 27 },
  { x: 70, y: 78, s: 27 },
  { x: 30, y: 78, s: 27 },
  { x: 17.5, y: 39.5, s: 27 },
]

function Porthole({ project, x, y, s }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
      style={{ left: `${x}%`, top: `${y}%`, width: `${s}%` }}
    >
      <div className="aspect-square w-full overflow-hidden rounded-full border border-line bg-ground transition-[transform,border-color] duration-200 ease-out group-hover:border-accent motion-safe:group-hover:scale-[1.05]">
        {project.cover?.svg ? (
          <div
            aria-hidden="true"
            className="h-full w-full p-[16%] text-ink opacity-70 transition-opacity duration-200 group-hover:opacity-100 [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: project.cover.svg }}
          />
        ) : project.cover?.url ? (
          <img
            src={project.cover.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
          />
        ) : null}
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 group-hover:text-ink sm:text-[11px]">
        {project.title}
      </span>
    </Link>
  )
}

export default function ProjectCluster() {
  const ring = projects.slice(0, RING.length)

  return (
    <div className="relative mx-auto aspect-square w-[min(86vw,34rem)]">
      {ring.map((project, i) => (
        <Porthole key={project.slug} project={project} {...RING[i]} />
      ))}

      <Link
        to="/projects"
        className="group absolute left-1/2 top-1/2 flex aspect-square w-[27%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-line bg-ground transition-[transform,border-color] duration-200 ease-out hover:border-accent motion-safe:hover:scale-[1.05]"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors duration-200 group-hover:text-ink sm:text-[11px]">
          Index
        </span>
        <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-accent">
          {String(projects.length).padStart(2, '0')} →
        </span>
      </Link>
    </div>
  )
}
