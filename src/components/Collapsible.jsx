import { useReducedMotion } from 'framer-motion'

/* Chevron toggle + the region it collapses. Split into two pieces because the
   trigger sits in a different place per use — inline after the org line on the
   About timeline, next to the heading on a project section. */

export function CollapseToggle({ open, onClick, label, controls, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${open ? 'Hide' : 'Show'} ${label}`}
      className={`shrink-0 text-muted transition-colors duration-200 hover:text-accent ${className}`}
    >
      <svg
        viewBox="0 0 12 12"
        className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" />
      </svg>
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
        transition: `grid-template-rows ${reduce ? '10ms' : '250ms'} cubic-bezier(0.25,0.1,0.25,1)`,
      }}
    >
      <div className="overflow-hidden" style={{ minHeight: 0 }} inert={!open}>
        <div className={className}>{children}</div>
      </div>
    </div>
  )
}
