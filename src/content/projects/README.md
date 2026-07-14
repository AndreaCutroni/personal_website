# Projects content

Each folder is one project. To add a project, add a folder:

```
<slug>/
  cover.svg|png|jpg|jpeg|webp   required — shown on the index grid, the
                                landing cluster, and the project page
  meta.json                     optional — data + page text
  drawings/                     optional — svg/png/jpg/webp/gif
  photos/                       optional — png/jpg/webp/gif
```

## Titles

The project title is the **folder name**, with dashes read as spaces:
`never-ending-markt` → "Never Ending Markt". Add a `"title"` field in
meta.json only if you want to override that.

## meta.json

All fields optional:

```json
{
  "order": 1,               // position in the index grid (default: last)
  "span": "large",          // bento size: large | wide | tall | standard
  "title": "…",             // overrides the folder-name title
  "team": "…",              // shown in the project data table
  "architect": "…",
  "program": "…",           // e.g. course / studio / client context
  "year": "…",
  "location": "…",
  "status": "…",
  "link": "https://…",      // "Published on…" link under the data table
  "description": "…",       // one-line lead shown on the project page
  "body": ["…", "…"]        // paragraphs for the project page
}
```

Empty strings and empty arrays are simply not displayed.

## Images

- SVGs are inlined and should use `stroke="currentColor"` so they recolor
  with the light/dark theme.
- PNG/JPG/WEBP/GIF are shown as-is (GIFs animate).
- Drawing and photo captions come from the filename: `Ground Floor.png` →
  GROUND FLOOR, `GIF_Rome.gif` → GIF ROME. Files sort alphabetically.
