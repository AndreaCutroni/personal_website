import { useReducedMotion } from 'framer-motion'

/* Chevron toggle + the region it collapses. Split into two pieces because the
   trigger sits in a different place per use — inline after the org line on the
   About timeline, next to the heading on a project section. */

/* Presentational only. Exported so a caller can build its own trigger — a
   project section makes the whole heading the button, and a button inside a
   button is invalid, so it cannot reuse CollapseToggle. */
export function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  )
}

export function CollapseToggle({ open, onClick, label, controls, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${open ? 'Hide' : 'Show'} ${label}`}
      className={`shrink-0 cursor-pointer text-muted transition-colors duration-200 hover:text-accent ${className}`}
    >
      <Chevron open={open} />
    </button>
  )
}

/* Collapses to and from an unknown content height with a CSS grid-row
   transition, so nothing has to measure scrollHeight. `inert` keeps the hidden
   content out of the tab order and the accessibility tree while it is closed —
   overflow:hidden alone still leaves links inside focusable.

   `className` is applied to an inner wrapper rather than the grid item itself:
   a `0fr` track floors at the item's min-content height, so padding or a border
   on the item survives the collapse as a ghost strip. One level deeper it gets
   clipped like everything else. */
export default function Collapsible({ open, id, children, className = '' }) {
  const reduce = useReducedMotion()

  return (
    <div
      id={id}
      style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        /* Without a fixed column, the browser is free to shrink the item's
           width toward min-content too while sizing the 0fr row — which
           rewraps the content onto far narrower lines and inflates the very
           height the row is trying to collapse to. Locking it at 100% keeps
           reflow out of the picture, so 0fr actually reaches ~0. */
        gridTemplateColumns: '100%',
        transition: `grid-template-rows ${reduce ? '10ms' : '250ms'} cubic-bezier(0.25,0.1,0.25,1)`,
      }}
    >
      {/* Only clips while actually shrunk — a 0fr track doesn't hide its own
          content by itself, so something has to while closed. Once open, the
          track already fits the content exactly, and an overflow-hidden
          ancestor with no work left to do is exactly the kind of clip
          boundary that produces a hairline seam in rounded descendants on
          Chrome (a real GPU-compositor bug, not a screenshot artifact) —
          removing it once settled costs nothing and avoids that. */}
      <div className={open ? '' : 'overflow-hidden'} style={{ minHeight: 0 }} inert={!open}>
        <div className={className}>{children}</div>
      </div>
    </div>
  )
}
