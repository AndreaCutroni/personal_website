/* Framed media for content that is a set rather than a sequence — hiding it
   behind a stepper would cost more than it gains.

   `layout: "row"` matches images by height and lets their widths run natural,
   the way a poster lays a strip of photographs out. `captions: false` drops the
   figcaption, for a single image whose section heading already names it. */
export default function ImageGrid({ items, columns = 2, layout = 'grid', captions = true }) {
  if (!items?.length) return null

  const Caption = ({ item }) =>
    captions ? (
      <figcaption className="mt-auto border-t border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
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

  /* Written out rather than interpolated, so Tailwind's scanner sees the class
     names. Three columns is for comparing the same drawing across cases. */
  const track = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns] ?? ''

  return (
    <div className={`grid gap-4 ${track}`}>
      {items.map((item) => (
        <figure
          key={item.file}
          className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
        >
          {/* Capped by height as well as width: a portrait drawing given the
              full container width runs several screens tall. Landscape work is
              width-bound and unaffected. */}
          <img
            src={item.url}
            alt={item.caption || item.label}
            loading="lazy"
            className="mx-auto h-auto max-h-[80vh] w-auto max-w-full"
          />
          <Caption item={item} />
        </figure>
      ))}
    </div>
  )
}
