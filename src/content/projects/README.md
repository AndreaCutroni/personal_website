# Projects content

Each folder is one project. To add a project, add a folder:

```
<slug>/
  meta.json        required — data + page text
  cover.svg        required — line drawing for the index grid + project page
  drawings/        optional — technical drawings (SVG, stroke="currentColor")
  photos/          optional — photographs (.jpg .jpeg .png .webp)
```

## meta.json

```json
{
  "order": 1,               // position in the index grid
  "title": "…",
  "architect": "…",
  "year": "…",
  "location": "…",
  "status": "…",            // e.g. "Completed 1939", "Under construction"
  "span": "large",          // bento size: large | wide | tall | standard
  "description": "…",       // one-line lead shown on the project page
  "body": ["…", "…"]        // paragraphs for the project page
}
```

## SVGs

Use `stroke="currentColor"` (not a fixed hex) so drawings recolor with the
light/dark theme. Drawing captions come from the filename: `plan.svg` → PLAN.
