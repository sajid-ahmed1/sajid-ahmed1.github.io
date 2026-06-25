# MarkItDown — Reduce Token Spend and Increase Efficiency

I came across Microsoft's [MarkItDown](https://github.com/microsoft/markitdown) recently and it's one of those tools that just makes sense the moment you think about it.

In September 2025 Microsoft open-sourced a Python library that converts PDFs, Excel files, Word docs, and even images into clean Markdown. On the surface that sounds mundane, but if you're working with LLMs the implications are massive.

## Why this matters for AI workflows

Markdown is basically the native language of large language models. They're trained on mountains of it, they parse it well, and crucially it's **token-efficient**. A table in Markdown is structured, readable, and compact. Compare that to what you get when you throw a PDF through an OCR tool: raw text where a table ends up as words separated by `|` characters with no real structure. The model then has to guess what goes where, burning through tokens and introducing errors along the way.

Before MarkItDown the alternatives were painful. Reading Excel files cell by cell, or running OCR on images of tables, gave you something that *technically* contained the right information but lost all the structure that made it meaningful. A financial table becomes a wall of text. Good luck getting an LLM to reason over that without hallucinating.

MarkItDown keeps the structure. Tables stay as tables. Headers stay as headers. Lists stay as lists. And your token bill drops because you're not wasting context window on noise.

## What excites me

The real power here is unlocking **non-standard data** that's been trapped in documents for years. Think about all the PDFs sitting in organisations: financial reports, research papers, government publications, all containing structured data in a format that's been too expensive or error-prone for AI to process reliably.

When you can cheaply convert those into clean Markdown, you open the door to economic insights and discovery from sources that were previously just not practical to work with at scale. That's a big deal for anyone doing data science in domains where the data lives in documents, not databases.

## My use case

I've got a side project where I'm taking old newspaper headlines about English football, decades of coverage, from a physical book and turning them into something usable for machine learning analysis. Before tools like this, the pipeline would have been: scan the pages, run OCR, spend hours cleaning up garbled output, manually fix every table and column that OCR mangled.

Now I can go from scanned PDF straight to structured Markdown that's ready for an LLM to analyse. Patterns in media sentiment, how coverage of certain clubs changed over time, which narratives dominated which eras. The kind of analysis that was always *theoretically* possible but never worth the preprocessing pain.

It's one of those tools that's simple in concept but genuinely changes what's practical to do.
