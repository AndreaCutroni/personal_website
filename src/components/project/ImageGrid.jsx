/* Framed media for content that is a set rather than a sequence — hiding it
   behind a stepper would cost more than it gains.

   `layout: "row"` matches images by height and lets their widths run natural,
   the way a poster lays a strip of photographs out. `captions: false` drops the
   figcaption, for a single image whose section heading already names it. */
export default function ImageGrid({ items, columns = 2, layout = 'grid', captions = true }) {
  if (!items?.length) return null

  const Caption = ({ item }) =>
    captions ? (
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {item.caption || item.label}
      </figcaption>
    ) : null

  if (layout === 'row') {
    return (
      <div className="flex flex-wrap items-start gap-3">
        {items.map((item) => (
          <figure
            key={item.file}
            className="overflow-hidden rounded-lg border border-line bg-surface"
          >
            <img
              src={item.url}
              alt={item.caption || item.label}
              loading="lazy"
              className="h-40 w-auto sm:h-52 lg:h-60"
            />
            <Caption item={item} />
          </figure>
        ))}
      </div>
    )
  }

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
          <Caption item={item} />
        </figure>
      ))}
    </div>
  )
}
