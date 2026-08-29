/* A process diagram rebuilt as native text rather than a screenshot, laid out
   on the same grid as the original sheet: nodes sit at explicit (col, row)
   positions and arrows occupy the gaps between them, so branches and the
   feedback loop read exactly as drawn. Below `sm` the grid cannot survive, so
   the same nodes stack in reading order. */

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

export default function FlowDiagram({
  columns = 3,
  rows = 4,
  nodes,
  arrows = [],
  groups = [],
  notes = [],
}) {
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
        className="hidden sm:grid"
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
        {arrows.map((a) => (
          <div
            key={`${a.col}-${a.row}-${a.dir}-${a.rowSpan ?? 1}`}
            style={
              a.dir === 'right'
                ? {
                    gridColumn: a.col * 2,
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
