/* Framed media in a 1- or 2-column grid. Used for supporting material that is
   a set rather than a sequence — hiding it behind a stepper would cost more
   than it gains. */
export default function ImageGrid({ items, columns = 2 }) {
  if (!items?.length) return null

  return (
    <div className={`grid gap-4 ${columns === 1 ? '' : 'sm:grid-cols-2'}`}>
      {items.map((item) => (
        <figure
          key={item.file}
          className="overflow-hidden rounded-lg border border-line bg-surface"
        >
          <img
            src={item.url}
            alt={item.caption || item.label}
            loading="lazy"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {item.caption || item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
