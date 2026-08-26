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
      className={`flex h-full text-accent ${
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
        <span className="rounded-t-md bg-accent px-3 py-2 text-center text-[13px] font-medium leading-tight text-ground">
          {node.label}
        </span>
        <ul className="flex flex-1 flex-col justify-center gap-1 rounded-b-md border-2 border-t-0 border-accent px-3 py-3">
          {node.items.map((item) => (
            <li key={item} className="text-center text-[13px] leading-tight">
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <span
      className={`flex h-full items-center justify-center rounded-md px-3 py-2 text-center text-[13px] font-medium leading-tight ${
        node.highlight ? 'bg-accent text-ground' : 'border-2 border-accent text-ink'
      }`}
    >
      {node.label}
    </span>
  )
}

export default function FlowDiagram({ columns = 3, rows = 4, nodes, arrows = [] }) {
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
        {nodes.map((node) => (
          <div
            key={node.label}
            style={{ gridColumn: node.col * 2 - 1, gridRow: node.row * 2 - 1 }}
          >
            <Node node={node} />
          </div>
        ))}
        {arrows.map((a) => (
          <div
            key={`${a.col}-${a.row}-${a.dir}`}
            style={
              a.dir === 'right'
                ? { gridColumn: a.col * 2, gridRow: a.row * 2 - 1 }
                : { gridColumn: a.col * 2 - 1, gridRow: a.row * 2 }
            }
          >
            <Arrow dir={a.dir} />
          </div>
        ))}
      </div>

      <ol className="flex flex-col gap-2 sm:hidden">
        {ordered.map((node) => (
          <li key={node.label}>
            <Node node={node} />
          </li>
        ))}
      </ol>
    </div>
  )
}
