# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal **"second brain"** — a public wiki of Sajid Ahmed's notes, served via GitHub Pages from the repo root. It started as a recruiter-facing portfolio and was deliberately pivoted to a wiki-first site (with a slim bio on the home page rather than a full portfolio).

### Intent of the three sections

These shape what content belongs where and how it should read:
- **Work** — a *portfolio of things I've done*: data science, Gen AI, and engineering write-ups. This is the recruiter-facing showcase, so it should stay polished and demonstrable.
- **Study** — study techniques, course/paper notes, and concepts I'm learning (Cambridge coursework etc.).
- **Personal** — a looser space to write, dump, and showcase anything that doesn't fit the other two.

Everything is **public and curated**: the working rule is "if it's not something I'd be happy for anyone to read, it doesn't go in the repo." There is no private area — the repo is a public `*.github.io` site and git history is permanent.

## It's a no-build, client-side site

There is no package manager, bundler, or test suite. `.nojekyll` disables Jekyll so files serve verbatim. Markdown is rendered **in the browser** via CDN libraries (`marked` + `DOMPurify` + `highlight.js`) — this is what keeps "author in markdown" possible without a build step.

### Developing & previewing

Must be served over HTTP (the app `fetch`es JSON/markdown, which fails on `file://`):

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

Deploy = push to `main`; GitHub Pages publishes the root. No build step.

## Architecture

Three source files plus a content tree:

- `index.html` — static shell for the **Windows 98 desktop**: `#desktop` (with `#desktop-icons`), `#windows` (where window elements are appended), `#taskbar` (Start button, task buttons, clock), a hidden `#start-menu`, and the CDN `<script>` tags. Loads `marked`, `DOMPurify`, `highlight.js`, then `js/main.js`.
- `js/main.js` — the whole app: loads the manifest, builds the desktop/Start menu, runs a small **window manager**, renders markdown, and powers the explorer search. Plain ES, `'use strict'`, no framework.

### UI model: a desktop, not a scrolling page

The site is presented as a Win98 desktop. Double-clicking a desktop icon (or a Start-menu item) opens content in a **draggable window**. The window manager is `openWindow(id, {title, icon, body, width})` plus `focusWindow` / `minimizeWindow` / `toggleWindow` / `closeWindow`, tracked in the `openWindows` Map (each window has a matching taskbar button). `makeDraggable` handles title-bar dragging; `zCounter` handles focus stacking. Content is produced by `open*` functions (`openAbout`, `openExplorer`, `openCategoryWindow`, `openNoteWindow`, `openTagWindow`, `openRecycleBin`, `openShutDown`).
- `css/style.css` — theme tokens (CSS custom properties in `:root`) + all wiki styles. Keep using the variables (`--primary`, `--secondary`, `--grad`, etc.) rather than hardcoding colors.
- `notes/` — the content. `notes/index.json` is the **manifest**; markdown notes live in `notes/work/`, `notes/study/`, `notes/personal/`.

### The manifest is the source of truth

`notes/index.json` drives everything — desktop icons, category windows, tag cloud, explorer search. **Adding a note = create the `.md` file AND add an entry to `notes/index.json`.** The site never directory-scans; it only knows about notes listed in the manifest. Each note entry needs: `slug` (unique, used in `#/note/<slug>` links), `title`, `category` (must match a category `id`), `tags` (array), `date` (`YYYY-MM-DD`, used for sorting/display), `summary`, and `file` (path relative to repo root). The manifest also holds `site` (name, tagline, avatar, social `links`, and a `popup` object for the fake-virus dialog) and the `categories` list (each `id` becomes a desktop icon + Start-menu entry).

### Link routing (`initLinkRouting`)

There is no hash router. Instead a single delegated click handler intercepts any `a[href^="#/"]` and opens the matching window: `#/note/<slug>`, `#/<category>`, `#/tag/<tag>`. This is why in-content links — note cards, tag chips, and markdown `[[wiki-links]]` (which `resolveWikiLinks` rewrites to `#/note/<slug>`) — all "just work": they're plain `#/` anchors caught by that handler. `state` (loaded once from the manifest) holds `bySlug`, `byCategory`, and `tags` lookups.

### Conventions when editing

- **Security:** all manifest-derived strings go through `esc()` before injection; URLs/attributes go through `attr()` (blocks `javascript:` etc.); rendered markdown is sanitized with `DOMPurify`. `.markdown-body` re-enables text selection (the desktop disables it globally). Preserve these on any new rendering path.
- **Wiki-links:** inside a note's markdown, `[[some-slug]]` auto-links to that note (via `resolveWikiLinks()`); an unknown slug renders as bold text, so it's safe to link a note before it exists.
- **Theme:** Windows 98. All bevels come from the `--face/--hilite/--light/--shadow/--dark` CSS vars in `:root` via the 2-tone-border + inset-`box-shadow` trick; reuse that pattern rather than inventing new borders. `--navy`/`--desktop` are the title-bar and desktop colors.
- **Fake-virus popup:** `spawnPopup` (capped by `MAX_POPUPS`); content is data-driven from `site.popup` in the manifest.
