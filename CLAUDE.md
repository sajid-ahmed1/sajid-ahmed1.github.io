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

- `index.html` — static shell: fixed `<nav>`, an empty `<main id="app">` the router fills, a `<footer>`, and the CDN `<script>` tags. Loads `marked`, `DOMPurify`, `highlight.js`, then `js/main.js`.
- `js/main.js` — the whole app: loads the manifest, runs a hash router, renders views, renders markdown, and powers search. Plain ES, `'use strict'`, no framework.
- `css/style.css` — theme tokens (CSS custom properties in `:root`) + all wiki styles. Keep using the variables (`--primary`, `--secondary`, `--grad`, etc.) rather than hardcoding colors.
- `notes/` — the content. `notes/index.json` is the **manifest**; markdown notes live in `notes/work/`, `notes/study/`, `notes/personal/`.

### The manifest is the source of truth

`notes/index.json` drives everything — home page, category tiles, tag cloud, search, and routing. **Adding a note = create the `.md` file AND add an entry to `notes/index.json`.** The site never directory-scans; it only knows about notes listed in the manifest. Each note entry needs: `slug` (unique, used in URLs), `title`, `category` (must match a category `id`), `tags` (array), `date` (`YYYY-MM-DD`, used for sorting/display), `summary`, and `file` (path relative to repo root). The manifest also holds `site` (name, tagline, avatar, social links) and the `categories` list.

### Router (in `js/main.js`)

Hash-based, runs on load and `hashchange`:
- `#/` → home / curiosity map (bio hero + category tiles + tag cloud + recent notes; the particle canvas only runs here)
- `#/<category>` → listing for `work` | `study` | `personal`
- `#/note/<slug>` → fetches the note's `.md`, renders it
- `#/tag/<tag>` → notes filtered by tag

`state` (loaded once from the manifest) holds `bySlug`, `byCategory`, and `tags` lookups that every view reads.

### Conventions when editing

- **Security:** all manifest-derived strings go through `esc()` before injection; URLs/attributes go through `attr()` (blocks `javascript:` etc.); rendered markdown is sanitized with `DOMPurify`. Preserve these on any new rendering path.
- **Wiki-links:** inside a note's markdown, `[[some-slug]]` auto-links to that note (via `resolveWikiLinks()`); an unknown slug renders as bold text, so it's safe to link a note before it exists.
- **Theme:** indigo/cyan. The accent palette is duplicated as literals in `style.css` (CSS vars) and `main.js` (canvas `COLORS`) — update both when changing the scheme.
