import { useId, useState } from 'react'

/* A wipe comparison between two views of the same street. The divider is a
   range input laid over the image at full size and made invisible: that gets
   pointer, touch and keyboard for free, and announces itself as a slider,
   where a hand-rolled drag handler would get none of it. */
function Compare({ before, after, caption, beforeLabel, afterLabel }) {
  const [pos, setPos] = useState(50)
  const id = useId()

  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative select-none">
        {/* The "after" sits underneath and sets the height; the "before" is
            clipped over it, so the pair must share an aspect ratio. */}
        <img src={after} alt={afterLabel} loading="lazy" className="block w-full" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt={beforeLabel}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-ground/90"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ground/80 bg-ground/90 font-mono text-[13px] leading-none text-ink">
            ↔
          </span>
        </div>

        {[
          ['left-3', beforeLabel],
          ['right-3', afterLabel],
        ].map(([side, text]) => (
          <span
            key={text}
            aria-hidden="true"
            className={`pointer-events-none absolute top-3 ${side} rounded-full bg-ground/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink`}
          >
            {text}
          </span>
        ))}

        <label htmlFor={id} className="sr-only">
          {`Reveal ${afterLabel} over ${beforeLabel}${caption ? ` — ${caption}` : ''}`}
        </label>
        <input
          id={id}
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {caption && (
        <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export default function BeforeAfter({ pairs, beforeLabel = 'Before', afterLabel = 'After' }) {
  if (!pairs?.length) return null

  /* Side by side from sm — the point is comparing the cities against each
     other, not one at a time. They stack only where the row would be too
     narrow to drag. */
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {pairs.map((pair) => (
        <Compare key={pair.caption ?? pair.after} {...pair} beforeLabel={beforeLabel} afterLabel={afterLabel} />
      ))}
    </div>
  )
}
