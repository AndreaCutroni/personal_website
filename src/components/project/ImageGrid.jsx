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
    <div className={`grid items-start gap-4 ${track}`}>
      {items.map((item) => (
        <figure
          key={item.urls ? item.urls.join('|') : item.file}
          className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
        >
          {item.urls ? (
            /* A stacked pair — e.g. ground and typical floor — sharing one
               caption below rather than each cell repeating the building's
               name. Direct children of the flex-col figure, the same as a
               single image: nesting another flex column around them hit a
               flexbox sizing bug where the images collapsed to 0×0. Half the
               normal cap each, so the pair sits at roughly the same total
               height as a single image beside it. */
            item.urls.map((url) => (
              <img
                key={url}
                src={url}
                alt={item.caption || item.label}
                loading="lazy"
                className="mx-auto h-auto max-h-[40vh] w-auto max-w-full"
              />
            ))
          ) : columns > 1 ? (
            /* A comparison row: same aspect ratio for every cell so captions
               line up, rather than the tallest drawing in the row dictating
               everyone else's height. Source images should be cropped close
               to square (~1:1) so object-cover has almost nothing to trim. */
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={item.url}
                alt={item.caption || item.label}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            /* Capped by height as well as width: a portrait drawing given the
               full container width runs several screens tall. Landscape work
               is width-bound and unaffected. */
            <img
              src={item.url}
              alt={item.caption || item.label}
              loading="lazy"
              className="mx-auto h-auto max-h-[80vh] w-auto max-w-full"
            />
          )}
          <Caption item={item} />
        </figure>
      ))}
    </div>
  )
}
