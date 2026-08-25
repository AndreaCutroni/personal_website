/* Headline numbers pulled out of the analysis so they stay selectable text
   rather than living inside a screenshot. */
export default function MetricRow({ metrics }) {
  if (!metrics?.length) return null

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
      {metrics.map((m) => (
        <div key={m.label} className="bg-surface px-4 py-5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {m.label}
          </dt>
          <dd className="mt-2">
            <span className="text-2xl font-semibold tracking-tight text-accent">{m.value}</span>
            {m.unit && <span className="ml-1 text-sm text-muted">{m.unit}</span>}
            {m.note && <p className="mt-1 text-xs leading-relaxed text-muted">{m.note}</p>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
