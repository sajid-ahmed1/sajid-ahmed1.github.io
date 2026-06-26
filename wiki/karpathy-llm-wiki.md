# Karpathy's LLM Wiki Pattern

Andrej Karpathy published a pattern for building personal knowledge bases with LLMs. The core argument: most people use RAG (retrieve chunks at query time, synthesise an answer), but nothing accumulates. The LLM rediscovers knowledge from scratch every time.

His alternative is a **persistent wiki** that the LLM builds and maintains incrementally. When you add a new source, the LLM doesn't just index it. It reads it, extracts the key information, and integrates it into existing pages, updating cross-references, flagging contradictions, and strengthening the evolving synthesis. The knowledge is compiled once and kept current.

## Three-layer architecture

1. **Raw sources** — immutable documents (articles, papers, data). The LLM reads from these but never modifies them.
2. **The wiki** — LLM-generated markdown files. Summaries, entity pages, concept pages, comparisons. The LLM owns this layer entirely.
3. **The schema** — a config file (like `CLAUDE.md`) that tells the LLM how the wiki is structured and what workflows to follow.

## Three operations

- **Ingest** — drop a source into raw, the LLM processes it across 10-15 wiki pages.
- **Query** — ask questions against the wiki. Good answers get filed back as new pages so explorations compound.
- **Lint** — periodic health checks for contradictions, orphan pages, missing cross-references, and stale claims.

## Why it works

Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The cost of maintenance drops to near zero.

Karpathy draws the parallel to Vannevar Bush's Memex (1945): a personal knowledge store with associative trails between documents. The part Bush couldn't solve was who does the maintenance. The LLM handles that.

## How this connects to my setup

This is essentially what I'm doing with my [second brain](how-i-update-the-second-brain.md), just with a different tool stack. Karpathy uses Obsidian as the IDE and the LLM as the programmer. I use Claude Code directly and GitHub Pages as the output. The pattern is the same: human curates and thinks, LLM does the bookkeeping.

The key insight I took from this: good query answers should be filed back into the wiki. That's what the [Outputs](../outputs/) section is for. Questions I ask that produce useful analysis shouldn't disappear into chat history.

## Related

- [How I Update the Second Brain](how-i-update-the-second-brain.md) — my implementation of this pattern
- [How I Take Notes](how-i-take-notes.md) — the note-taking system this feeds into
- [Building RAG Pipelines](building-rag-pipelines.md) — Karpathy explicitly contrasts his approach with RAG
- [MarkItDown](markitdown-token-efficiency.md) — relevant for the "ingest" step (getting documents into markdown)
