// Each project is a self-contained folder (see README.md):
//   <slug>/meta.json          — optional data + page text
//   <slug>/cover.(svg|png|jpg|jpeg|webp)
//   <slug>/drawings/*         — svg/png/jpg/webp/gif, label from filename
//   <slug>/photos/*           — photographs
// The project title is the folder name with dashes read as spaces
// (never-ending-markt → "Never Ending Markt"); meta.json "title" overrides.
const metas = import.meta.glob('./*/meta.json', { eager: true })
const coversSvg = import.meta.glob('./*/cover.svg', { eager: true, query: '?raw', import: 'default' })
const coversImg = import.meta.glob('./*/cover.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})
// A project can lead with a silent looping clip instead of a still. The still
// stays required — it is what the index grid and rail show.
const coversVideo = import.meta.glob('./*/cover.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const drawingsSvg = import.meta.glob('./*/drawings/*.svg', { eager: true, query: '?raw', import: 'default' })
const drawingsImg = import.meta.glob('./*/drawings/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const photos = import.meta.glob('./*/photos/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
// The project's pages cut out of the portfolio, offered as a preview rather
// than a download — the browser's own viewer has the save button.
const sheets = import.meta.glob('./*/sheets.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
})

const slugOf = (path) => path.split('/')[1]

const titleFromSlug = (slug) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const fileLabel = (path) =>
  path
    .split('/')
    .pop()
    .replace(/\.[a-z]+$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

const collect = (svgModules, imgModules, prefix) =>
  [
    ...Object.entries(svgModules)
      .filter(([p]) => p.startsWith(prefix))
      .map(([p, svg]) => ({ file: p, label: fileLabel(p), svg })),
    ...Object.entries(imgModules)
      .filter(([p]) => p.startsWith(prefix))
      .map(([p, url]) => ({ file: p, label: fileLabel(p), url })),
  ].sort((a, b) => a.file.localeCompare(b.file))

// A folder counts as a project if it has a meta.json or a cover.
const slugs = [
  ...new Set(
    [...Object.keys(metas), ...Object.keys(coversSvg), ...Object.keys(coversImg)].map(slugOf),
  ),
]

export const projects = slugs
  .map((slug) => {
    const prefix = `./${slug}/`
    const metaModule = metas[`${prefix}meta.json`]
    const meta = metaModule ? (metaModule.default ?? metaModule) : {}
    const coverSvg = coversSvg[`${prefix}cover.svg`]
    const coverUrl = Object.entries(coversImg).find(([p]) => p.startsWith(prefix))?.[1]
    const coverVideo = Object.entries(coversVideo).find(([p]) => p.startsWith(prefix))?.[1]
    return {
      order: 999,
      span: 'standard',
      ...meta,
      slug,
      title: meta.title || titleFromSlug(slug),
      cover: coverSvg
        ? { svg: coverSvg }
        : coverUrl || coverVideo
          ? { url: coverUrl, video: coverVideo }
          : null,
      drawings: collect(drawingsSvg, drawingsImg, `${prefix}drawings/`),
      photos: collect({}, photos, `${prefix}photos/`),
      sheets: sheets[`${prefix}sheets.pdf`] ?? null,
    }
  })
  .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))

export const getProject = (slug) => projects.find((p) => p.slug === slug)

/* The three sections the portfolio is organised into. A project's palette
   already names its section, so the category is read from that rather than
   stored twice. Tags stay free-form underneath. */
export const categories = [
  { id: 'computation', label: 'Computational Design' },
  { id: 'construction', label: 'BIM & Smart Construction' },
  { id: 'intelligence', label: 'AI & Machine Learning' },
]

export const categoryOf = (palette) => categories.find((c) => c.id === palette)
