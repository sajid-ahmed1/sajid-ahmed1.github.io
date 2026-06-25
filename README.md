# Sajid Ahmed — Second Brain

A personal knowledge wiki served via GitHub Pages, styled as a Windows 98 desktop. Notes are written in markdown and rendered client-side — no build step, no framework.

**Live site:** [sajid-ahmed1.github.io](https://sajid-ahmed1.github.io)

## How it works

The site loads a single manifest (`notes/index.json`) that lists every note, category, and piece of site config. Double-clicking desktop icons opens draggable windows. Markdown is rendered in the browser using CDN libraries (marked + DOMPurify + highlight.js).

## Adding a new note

1. **Write the markdown file** in the right category folder:
   ```
   notes/work/my-new-note.md
   notes/study/my-new-note.md
   notes/personal/my-new-note.md
   notes/tech-interests/my-new-note.md
   ```

2. **Add an entry to `notes/index.json`** in the `notes` array:
   ```json
   {
     "slug": "my-new-note",
     "title": "My New Note",
     "category": "work",
     "tags": ["tag1", "tag2"],
     "date": "2026-06-25",
     "summary": "A one-line summary that shows on the card.",
     "file": "notes/work/my-new-note.md"
   }
   ```

3. **Update the knowledge graph** in `data/graph.json` — add a node and any edges to related notes.

4. **Push to `main`** — GitHub Pages deploys automatically.

That's it. The site picks up new notes from the manifest, no build needed.

## Using the Digital Librarian (with Claude Code)

Instead of doing the above manually, just open Claude Code and describe what you want to write. Claude knows the structure (via `CLAUDE.md`) and will:

1. Dump your raw thoughts into `raw/` as a dated log
2. Create the clean markdown file in the right place
3. Add the manifest entry to `notes/index.json`
4. Update `data/graph.json` with new nodes and edges
5. Auto-link to existing notes via shared tags
6. Commit and push

### Three content types

| Type | Icon | What it is | Example |
|------|------|-----------|---------|
| **Notes** | ✍️ | Your original writing and curated thoughts | "Building RAG pipelines that actually retrieve" |
| **Wiki** | 🔗 | Links, tools, and resources you dump — cleaned up by AI | A URL to a tool with a summary of why it's useful |
| **Outputs** | 🧠 | Synthesised briefs that pull from multiple sources | "Should we use RAG or fine-tuning for support bots?" |

**Notes** go in `notes/<category>/`. **Wiki** entries go in `wiki/`. **Outputs** go in `outputs/`.

Example: *"Here's a link to this cool tool I found..."* → Claude saves it as a wiki entry, tags it, and links it to your related notes in the knowledge graph.

## Folder structure

```
index.html              → the Win98 desktop shell
js/main.js              → the entire app (window manager, rendering, search)
css/style.css           → Win98 theme (CSS custom properties)
notes/
  index.json            → manifest (source of truth for all content)
  work/                 → data science, Gen AI, engineering notes
  study/                → Cambridge coursework, papers, concepts
  personal/             → reflections, meta, anything else
  tech-interests/       → tools, trends, tech commentary
data/
  graph.json            → knowledge graph (nodes + edges for the Brain Map)
raw/                    → messy notes, book clips, quick ideas
wiki/                   → organised wiki output with cross-links
outputs/                → complex briefs and reports
images/                 → widget photos for the desktop
```

## Running locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Must be served over HTTP — `fetch` calls fail on `file://`.

## Wiki-links

Inside any markdown note, use `[[slug]]` to link to another note. It auto-resolves to a clickable link. If the slug doesn't exist yet, it renders as bold text (safe to link before the note exists).

## Knowledge graph

`data/graph.json` powers the interactive Brain Map on the desktop. Every note, wiki entry, and output is a node. Cross-references and shared tags become edges. Node groups match content types (work, study, personal, tech-interests, wiki, output). Edge types:

- `navigation` — index links to a page
- `wiki-link` — explicit `[[slug]]` cross-reference between notes
- `thematic` — same topic cluster (shared tags or content overlap)
