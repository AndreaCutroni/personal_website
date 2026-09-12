/* A process diagram rebuilt as native text rather than a screenshot, laid out
   on the same grid as the original sheet: nodes sit at explicit (col, row)
   positions and arrows occupy the gaps between them, so branches and the
   feedback loop read exactly as drawn. Below `sm` the grid cannot survive, so
   the same nodes stack in reading order.

   Straight arrows cover the common case — adjacent cells, same row or column.
   A `curves` entry is for the rest: a connector between two arbitrary node
   edges (a skip-ahead merge, a feedback loop back into an earlier stage).
   Those are measured in actual pixels off the rendered nodes, so they stay
   correct across reflows rather than being hand-plotted in grid units. */

import { useLayoutEffect, useRef, useState } from 'react'

function Head({ dir }) {
  const base = 'block h-0 w-0 border-solid'
  if (dir === 'right')
    return (
      <span
        className={`${base} border-y-[5px] border-l-[7px] border-r-0 border-y-transparent`}
        style={{ borderLeftColor: 'currentColor' }}
      />
    )
  if (dir === 'up')
    return (
      <span
        className={`${base} border-x-[5px] border-b-[7px] border-t-0 border-x-transparent`}
        style={{ borderBottomColor: 'currentColor' }}
      />
    )
  return (
    <span
      className={`${base} border-x-[5px] border-t-[7px] border-b-0 border-x-transparent`}
      style={{ borderTopColor: 'currentColor' }}
    />
  )
}

function Arrow({ dir }) {
  const vertical = dir === 'down' || dir === 'up'
  return (
    <span
      aria-hidden="true"
      /* h-full on both axes: the grid cell stretches to the row height, and
         without it a horizontal arrow collapses to its own 7px and sits at the
         top of the cell rather than on the node's midline. */
      className={`flex h-full text-accent-mark ${
        vertical ? 'flex-col items-center justify-center' : 'w-full items-center'
      }`}
    >
      {dir === 'up' && <Head dir="up" />}
      <span className={vertical ? 'w-[2px] flex-1 bg-current' : 'h-[2px] flex-1 bg-current'} />
      {dir !== 'up' && <Head dir={dir} />}
    </span>
  )
}

function Node({ node }) {
  // A stage that names its sub-steps: filled header over a bordered card,
  // as the sheet draws it.
  if (node.items?.length) {
    return (
      <div className="flex h-full flex-col">
        <span className="rounded-t-md bg-accent-mark px-3 py-2 text-center text-[13px] font-medium leading-tight text-ground">
          {node.label}
        </span>
        <ul className="flex flex-1 flex-col justify-center gap-1 rounded-b-md border-2 border-t-0 border-accent-mark px-3 py-3">
          {node.items.map((item) => (
            <li key={item} className="text-center text-[13px] leading-tight">
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  /* Three fills, matching how the sheets actually draw a node: solid mark with
     reversed text, a light wash of the mark with normal text, or outline only.
     All of them use --accent-mark, not --accent: borders and fills are
     graphical objects at a 3:1 contrast floor, so they can carry the true brand
     hue. --accent is the darkened variant and belongs to text only. */
  const fill = node.highlight
    ? 'bg-accent-mark text-ground'
    : node.tint
      ? 'bg-accent-mark/35 text-ink'
      : 'border-2 border-accent-mark text-ink'

  return (
    <span
      className={`relative flex h-full items-center justify-center rounded-md px-3 py-2 text-center text-[13px] font-medium leading-tight ${fill}`}
    >
      {node.label}
      {/* A pill clipped to the top-right corner, the way the sheet tags a stage
          that carries something extra. */}
      {node.badge && (
        <span className="absolute -top-2.5 -right-2 rounded-full bg-accent-mark px-2 py-0.5 text-[10px] font-medium leading-tight text-ground">
          {node.badge}
        </span>
      )}
    </span>
  )
}

/* A logical column maps to grid column 2c-1; spanning n columns also swallows
   the n-1 gaps between them. */
const track = (col, span = 1) => (span > 1 ? `${col * 2 - 1} / span ${span * 2 - 1}` : col * 2 - 1)

// Direction of travel on arrival at each side, as a unit vector — so an
// arrowhead built from it points the way the line is actually moving, and a
// line shortened along it stops flush with the tip rather than past it.
const SIDE_ENTRY = { top: [0, 1], bottom: [0, -1], left: [1, 0], right: [-1, 0] }

function anchor(rect, containerRect, side) {
  const x = rect.left - containerRect.left
  const y = rect.top - containerRect.top
  if (side === 'top') return { x: x + rect.width / 2, y }
  if (side === 'bottom') return { x: x + rect.width / 2, y: y + rect.height }
  if (side === 'left') return { x, y: y + rect.height / 2 }
  return { x: x + rect.width, y: y + rect.height / 2 }
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const isVertical = (side) => side === 'top' || side === 'bottom'

/* Elbow connectors between two node edges — a branch that skips a stage, a
   feedback loop — measured off the actual rendered boxes rather than plotted
   in grid units, so they stay attached as the layout reflows. Drawn as a
   single 90° bend with a chamfered corner, matching the straight-line
   language the rest of the diagram already uses rather than a soft curve. */
function Curves({ containerRef, nodeRefs, curves }) {
  const [paths, setPaths] = useState([])

  useLayoutEffect(() => {
    if (!curves?.length) return undefined

    const measure = () => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      const next = curves.map((c) => {
        const fromEl = nodeRefs.current.get(`${c.from.col}-${c.from.row}`)
        const toEl = nodeRefs.current.get(`${c.to.col}-${c.to.row}`)
        if (!fromEl || !toEl) return null

        const start = anchor(fromEl.getBoundingClientRect(), containerRect, c.from.side)
        const end = anchor(toEl.getBoundingClientRect(), containerRect, c.to.side)
        const [tx, ty] = SIDE_ENTRY[c.to.side]

        // The bend sits at the point that keeps the line straight off both
        // node edges: level with the far point on the axis the line leaves
        // on, in line with it on the axis it arrives on.
        const corner = isVertical(c.from.side) ? { x: start.x, y: end.y } : { x: end.x, y: start.y }
        const r = clamp(Math.min(Math.abs(corner.x - start.x) || Infinity, Math.abs(corner.y - start.y) || Infinity, Math.abs(end.x - corner.x) || Infinity, Math.abs(end.y - corner.y) || Infinity) * 0.6, 6, 16)

        const preCorner = isVertical(c.from.side)
          ? { x: corner.x, y: corner.y - Math.sign(corner.y - start.y || 1) * r }
          : { x: corner.x - Math.sign(corner.x - start.x || 1) * r, y: corner.y }
        const postCorner = isVertical(c.from.side)
          ? { x: corner.x + Math.sign(end.x - corner.x || 1) * r, y: corner.y }
          : { x: corner.x, y: corner.y + Math.sign(end.y - corner.y || 1) * r }

        // Stop the line short of the tip, behind the arrowhead's base, so the
        // head sits flush against the node from the outside rather than
        // poking into it.
        const headLen = 9
        const lineEnd = { x: end.x - tx * headLen, y: end.y - ty * headLen }

        const angle = (Math.atan2(-ty, -tx) * 180) / Math.PI + 180
        return {
          key: `${c.from.col}-${c.from.row}-${c.to.col}-${c.to.row}`,
          d: `M ${start.x} ${start.y} L ${preCorner.x} ${preCorner.y} Q ${corner.x} ${corner.y} ${postCorner.x} ${postCorner.y} L ${lineEnd.x} ${lineEnd.y}`,
          tip: end,
          angle,
        }
      })
      setPaths(next.filter(Boolean))
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    window.addEventListener('resize', measure)
    /* A section starting collapsed measures at zero — the diagram's own box
       doesn't resize when an ancestor Collapsible opens, only its clipping
       does, so the ResizeObserver above never fires for it. Its
       grid-template-rows transition ending is the signal that the real
       layout is ready to read. */
    window.addEventListener('transitionend', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('transitionend', measure)
    }
  }, [containerRef, nodeRefs, curves])

  if (!paths.length) return null

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-accent-mark"
    >
      {paths.map((p) => (
        <g key={p.key}>
          <path d={p.d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          {/* Tip at the local origin, base trailing behind it, so translating
              to the node edge puts the point there — not the flat end. */}
          <polygon
            points="-9,-5 0,0 -9,5"
            fill="currentColor"
            transform={`translate(${p.tip.x} ${p.tip.y}) rotate(${p.angle})`}
          />
        </g>
      ))}
    </svg>
  )
}

export default function FlowDiagram({
  columns = 3,
  rows = 4,
  nodes,
  arrows = [],
  groups = [],
  notes = [],
  curves = [],
}) {
  const containerRef = useRef(null)
  const nodeRefs = useRef(new Map())

  if (!nodes?.length) return null

  // logical col c -> grid column 2c-1; the gap after it -> 2c. Same for rows.
  const gridCols = Array.from({ length: columns * 2 - 1 }, (_, i) =>
    i % 2 ? '1.75rem' : 'minmax(0, 1fr)',
  ).join(' ')
  const gridRows = Array.from({ length: rows * 2 - 1 }, (_, i) =>
    i % 2 ? '1.5rem' : 'auto',
  ).join(' ')

  const ordered = [...nodes].sort((a, b) => a.row - b.row || a.col - b.col)

  return (
    <div>
      <div
        ref={containerRef}
        className="relative hidden sm:grid"
        style={{ gridTemplateColumns: gridCols, gridTemplateRows: gridRows }}
      >
        {/* Drawn first and inset negatively so the dotted outline sits behind
            the stages it encloses, standing off them on every side. */}
        {groups.map((g) => (
          <div
            key={`${g.col}-${g.row}-${g.span}`}
            aria-hidden="true"
            className="pointer-events-none -m-2.5 rounded-xl border-2 border-dotted border-accent-mark"
            style={{ gridColumn: track(g.col, g.span), gridRow: g.row * 2 - 1 }}
          />
        ))}
        {nodes.map((node) => (
          <div
            key={`${node.col}-${node.row}-${node.label}`}
            ref={(el) => {
              if (el) nodeRefs.current.set(`${node.col}-${node.row}`, el)
              else nodeRefs.current.delete(`${node.col}-${node.row}`)
            }}
            className="relative"
            style={{
              gridColumn: node.col * 2 - 1,
              /* rowSpan covers the gap tracks it crosses, so a single stage can
                 stand beside several inputs the way a fan-in is drawn. */
              gridRow: node.rowSpan
                ? `${node.row * 2 - 1} / span ${node.rowSpan * 2 - 1}`
                : node.row * 2 - 1,
            }}
          >
            <Node node={node} />
          </div>
        ))}
        <Curves containerRef={containerRef} nodeRefs={nodeRefs} curves={curves} />
        {arrows.map((a) => (
          <div
            key={`${a.col}-${a.row}-${a.dir}-${a.rowSpan ?? 1}`}
            style={
              a.dir === 'right'
                ? {
                    /* colSpan carries the line straight past an intervening
                       stage — a branch that skips a step everyone else on its
                       row goes through — rather than stopping at the next gap. */
                    gridColumn: a.colSpan
                      ? `${a.col * 2} / span ${a.colSpan * 2 - 1}`
                      : a.col * 2,
                    /* Spanning the same rows as the stages it joins puts the
                       arrowhead on their shared midline, not on one input's. */
                    gridRow: a.rowSpan
                      ? `${a.row * 2 - 1} / span ${a.rowSpan * 2 - 1}`
                      : a.row * 2 - 1,
                  }
                : { gridColumn: a.col * 2 - 1, gridRow: a.row * 2 }
            }
          >
            <Arrow dir={a.dir} />
          </div>
        ))}
      </div>

      {/* Captions hang below on their own grid rather than inside the stages,
          so every box stays the same height and a caption can sit under a
          group of them. */}
      {notes.length > 0 && (
        <div className="mt-3 hidden sm:grid" style={{ gridTemplateColumns: gridCols }}>
          {notes.map((n) => (
            <p
              key={`${n.col}-${n.lines.join()}`}
              className="text-center text-[13px] font-semibold leading-tight text-accent"
              style={{ gridColumn: track(n.col, n.span) }}
            >
              {n.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}

      <ol className="flex flex-col gap-2 sm:hidden">
        {ordered.map((node) => (
          <li key={`${node.col}-${node.row}-${node.label}`}>
            <Node node={node} />
            {/* Stacked, a caption belongs to the stage it starts under. */}
            {notes
              .filter((n) => n.col === node.col && (n.row ?? 1) === node.row)
              .map((n) => (
                <p
                  key={n.lines.join()}
                  className="mt-1 text-center text-[12px] font-semibold leading-tight text-accent"
                >
                  {n.lines.join(' · ')}
                </p>
              ))}
          </li>
        ))}
      </ol>
    </div>
  )
}
