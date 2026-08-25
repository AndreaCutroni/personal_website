import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const pad = (n) => String(n).padStart(2, '0')

/* Stage + arrows + filmstrip for genuinely sequential content. Reserved for
   material that is read in order — a set of parallel results belongs in an
   ImageGrid, where nothing is hidden behind a stepper.

   The crossfade is a plain CSS opacity transition rather than a motion
   component: every scene stays mounted, so there is no enter/exit to
   coordinate and no layout shift between steps. */
export default function StoryPlayer({ scenes, aspect = '16 / 9' }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  if (!scenes?.length) return null

  const count = scenes.length
  const go = (i) => setActive((i + count) % count)
  const current = scenes[active]

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(active - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(active + 1)
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      role="group"
      aria-roledescription="story player"
      aria-label="Process steps"
    >
      <div className="relative overflow-hidden rounded-lg border border-line bg-surface">
        {/* Height is viewport-driven rather than a fixed ratio, so the stage,
            caption and filmstrip all fit on screen together. object-contain
            then letterboxes whatever aspect the scene actually is. */}
        <div className="relative" style={{ height: 'clamp(220px, 52vh, 560px)' }}>
          {scenes.map((scene, i) => (
            <img
              key={scene.file}
              src={scene.url}
              alt={`${scene.title} — ${scene.caption}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              aria-hidden={i !== active}
              className="absolute inset-0 h-full w-full object-contain p-2 sm:p-4"
              style={{
                opacity: i === active ? 1 : 0,
                transition: `opacity ${reduce ? '10ms' : '280ms'} ease-out`,
                pointerEvents: i === active ? 'auto' : 'none',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="Previous step"
          className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-ground/90 text-muted transition-colors duration-200 hover:border-accent-mark hover:text-accent"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="Next step"
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-ground/90 text-muted transition-colors duration-200 hover:border-accent-mark hover:text-accent"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="mt-3 flex items-baseline gap-4" aria-live="polite">
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          {pad(active + 1)} / {pad(count)}
        </span>
        <div className="min-w-0">
          <p className="font-medium">{current.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{current.caption}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
        {scenes.map((scene, i) => (
          <button
            key={scene.file}
            type="button"
            onClick={() => go(i)}
            aria-label={`Step ${i + 1}: ${scene.title}`}
            aria-current={i === active ? 'true' : undefined}
            className={`w-20 shrink-0 overflow-hidden rounded-md border bg-surface transition-colors duration-200 sm:w-24 ${
              i === active ? 'border-accent-mark' : 'border-line hover:border-accent-mark/60'
            }`}
          >
            <img
              src={scene.url}
              alt=""
              loading="lazy"
              style={{ aspectRatio: aspect }}
              className={`w-full object-contain transition-opacity duration-200 ${
                i === active ? 'opacity-100' : 'opacity-60'
              }`}
            />
            <span
              className={`block truncate px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] ${
                i === active ? 'text-ink' : 'text-muted'
              }`}
            >
              {scene.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
