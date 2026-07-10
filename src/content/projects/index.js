// Each project is a self-contained folder:
//   <slug>/meta.json          — data + body text (see README.md)
//   <slug>/cover.svg          — line drawing, stroke="currentColor"
//   <slug>/drawings/*.svg     — technical drawings, label from filename
//   <slug>/photos/*           — photographs (jpg/png/webp)
// Adding a folder adds a project everywhere.
const metas = import.meta.glob('./*/meta.json', { eager: true })
const covers = import.meta.glob('./*/cover.svg', { eager: true, query: '?raw', import: 'default' })
const drawings = import.meta.glob('./*/drawings/*.svg', { eager: true, query: '?raw', import: 'default' })
const photos = import.meta.glob('./*/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const fileLabel = (path) =>
  path.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' ').toUpperCase()

export const projects = Object.entries(metas)
  .map(([path, mod]) => {
    const slug = path.split('/')[1]
    const prefix = `./${slug}/`
    return {
      slug,
      cover: covers[`${prefix}cover.svg`],
      drawings: Object.entries(drawings)
        .filter(([p]) => p.startsWith(prefix))
        .map(([p, svg]) => ({ label: fileLabel(p), svg })),
      photos: Object.entries(photos)
        .filter(([p]) => p.startsWith(prefix))
        .map(([p, url]) => ({ label: fileLabel(p), url })),
      ...(mod.default ?? mod),
    }
  })
  .sort((a, b) => a.order - b.order)

export const getProject = (slug) => projects.find((p) => p.slug === slug)
