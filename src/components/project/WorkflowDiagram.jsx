/* The Grasshopper definition rebuilt as native text rather than a screenshot,
   so it stays legible, selectable and able to reflow on small screens.

   Desktop mirrors the original sheet: a Site Boundary spine on the left,
   vertical program labels, filled column headers, dashed parameter cells, and
   three tracks converging on a shared Aggregation → Analysis → Output tail.
   Below `sm` that geometry cannot survive, so the same data re-renders as a
   stack of labelled steps. The original's filled headers are navy; here they
   take the project accent so the diagram themes with the rest of the page. */

function Cell({ cell }) {
  if (!cell) {
    // The Buffer Zone track skips these stages — the original draws a bare
    // connector line straight through to the aggregation point.
    return (
      <div className="flex items-center px-1" aria-hidden="true">
        <span className="h-px w-full bg-line" />
      </div>
    )
  }

  const lines = typeof cell === 'string' ? [cell] : cell.lines
  const highlight = typeof cell === 'object' && cell.highlight

  return (
    <div
      className={`flex h-full flex-col justify-center rounded-md border border-dashed px-2 py-2 text-center ${
        highlight ? 'border-accent' : 'border-muted/50'
      }`}
    >
      {lines.map((line) => (
        <span key={line} className="text-[13px] font-medium leading-tight">
          {line}
        </span>
      ))}
    </div>
  )
}

function Header({ children }) {
  return (
    <div className="rounded-sm bg-accent px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ground">
      {children}
    </div>
  )
}

function SharedStage({ stage }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-md border border-dashed border-muted/50 px-2 py-2 text-center">
      <p className="text-sm font-semibold leading-tight">{stage.title}</p>
      {stage.items?.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {stage.items.map((item) => (
            <li key={item} className="text-xs text-muted">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function WorkflowDiagram({ boundary, columns, rows, shared }) {
  if (!rows?.length) return null

  const trackColumns = columns.slice(0, 3)
  const sharedColumns = columns.slice(3)

  return (
    <div>
      {/* ---------------- desktop: the sheet as drawn ---------------- */}
      <div
        className="hidden gap-x-2 gap-y-2 sm:grid"
        style={{
          /* minmax(0, …) on the parameter columns: a bare `1fr` floors at
             min-content, so they would otherwise resolve to three different
             widths from their own text. The shared tail instead floors at
             7.5rem — "Environmental" and "Visualization" are unbreakable words
             ~97px and ~86px wide, and a narrower cell spills them. */
          gridTemplateColumns:
            '1.25rem 1.5rem repeat(3, minmax(0, 1fr)) 1.5rem repeat(3, minmax(7.5rem, 1fr))',
          gridTemplateRows: 'auto repeat(3, minmax(3rem, 1fr))',
        }}
      >
        {/* header band */}
        {trackColumns.map((column, i) => (
          <div key={column} style={{ gridColumn: i + 3, gridRow: 1 }}>
            <Header>{column}</Header>
          </div>
        ))}
        {sharedColumns.map((column, i) => (
          <div key={column} style={{ gridColumn: i + 7, gridRow: 1 }}>
            <Header>{column}</Header>
          </div>
        ))}

        {/* site boundary spine, spanning every track */}
        {boundary && (
          <div
            style={{ gridColumn: 1, gridRow: '2 / 5' }}
            className="flex items-center justify-center rounded-md border border-line"
          >
            <span
              className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {boundary}
            </span>
          </div>
        )}

        {/* one row per program track */}
        {rows.map((row, r) => (
          <div
            key={row.label}
            style={{ gridColumn: 2, gridRow: r + 2 }}
            className="flex items-center justify-center"
          >
            <span
              className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {row.label}
            </span>
          </div>
        ))}
        {rows.map((row, r) =>
          row.cells.map((cell, c) => (
            <div key={`${row.label}-${trackColumns[c]}`} style={{ gridColumn: c + 3, gridRow: r + 2 }}>
              <Cell cell={cell} />
            </div>
          )),
        )}

        {/* the three tracks meeting at a single point before aggregation */}
        <div style={{ gridColumn: 6, gridRow: '2 / 5' }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full text-muted"
            aria-hidden="true"
          >
            <path
              d="M0 16.7 H40 M0 83.3 H40 M40 16.7 V83.3 M0 50 H100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {shared.map((stage, i) => (
          <div key={stage.title} style={{ gridColumn: i + 7, gridRow: '2 / 5' }}>
            <SharedStage stage={stage} />
          </div>
        ))}
      </div>

      {/* ---------------- mobile: same data, stacked ---------------- */}
      <div className="space-y-6 sm:hidden">
        {boundary && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{boundary}</p>
        )}
        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              {row.label}
            </p>
            <div className="space-y-2">
              {row.cells.map((cell, c) =>
                cell ? (
                  <div key={trackColumns[c]}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      {trackColumns[c]}
                    </span>
                    <div className="mt-1">
                      <Cell cell={cell} />
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span aria-hidden="true" className="mr-2 text-accent">
            ↓
          </span>
          All three tracks converge
        </p>
        <div className="space-y-2">
          {shared.map((stage, i) => (
            <div key={stage.title}>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {sharedColumns[i]}
              </span>
              <div className="mt-1">
                <SharedStage stage={stage} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
