# Turning Football Articles into RAG and Structured Data

**Live demo:** [streamlit.app →](https://turning-football-articles-into-rag-structured-data-gxf355pvfr7.streamlit.app) · **Repo:** [GitHub →](https://github.com/sajid-ahmed1/Turning-Football-Articles-into-RAG-Structured-Data)

Built alongside Cambridge's D001 (Non-Structured Data) module — not a course submission, but a self-directed project applying the concepts (TF-IDF, embeddings, topic modelling) to a real, messy, small corpus and being honest about what actually works at that scale.

## What it is

A scanned 1880s–1920s football history book, turned into a question-answering system. You ask it something the book covers — "What happened in the Khaki Cup final?" — it retrieves the relevant articles, hands them to Claude with a grounding prompt, and gives you a cited answer. You ask something the book doesn't cover — "Who won the 1998 World Cup?" — it refuses rather than hallucinating.

The pipeline end-to-end:

1. **Ingestion** — 30 scanned pages, vision LLM extraction into structured JSON per page (articles, sidebars, score tables, captions from irregular multi-column layouts)
2. **Corpus** — 81 articles, ~16,300 words, stored as a parquet file
3. **Retrieval** — three strategies: sparse (TF-IDF), dense (OpenAI `text-embedding-3-small`), hybrid (Reciprocal Rank Fusion of both)
4. **Generation** — Claude with a grounding prompt; refuses to answer when the corpus doesn't cover it
5. **Interface** — Streamlit app, pick your retrieval strategy, see which articles were retrieved

## The interesting decisions

**No vector database.** At n=81, brute-force cosine similarity over a NumPy array is the index. FAISS or Chroma would have been cargo-culting — genuine engineering complexity with no payoff until you're at 10⁴–10⁵ vectors. I called this out rather than using a vector DB for the CV line.

**LDA topic modelling broke down.** 81 documents is below the scale where LDA topics are stable — you get noise, not signal. Rather than report numbers I couldn't defend, I documented why it doesn't hold up and moved on. The notebook (`07_evaluation.ipynb`) explains the reasoning.

**My first eval set proved nothing.** Hit@k at n=81 saturated at 100% almost immediately with a small evaluation set. I had to rebuild it with harder distractors to get a metric that could actually catch a regression. The lesson: an evaluation that can't fail is useless.

**5/30 pages were flagged by Anthropic's vision model.** Old football photography — misread as policy-sensitive content. Sonnet cleared 24 pages, Opus recovered one more, five needed manual transcription. The honest finding: automated extraction pipelines need a manual-review path for silent, hard-to-diagnose failures, not just a retry loop.

## Results

| Step | Latency |
|---|---|
| Sparse retrieve (TF-IDF) | ~0.01s |
| Hybrid retrieve (RRF) | ~0.17s |
| Dense retrieve (OpenAI embed call) | ~0.85s |
| Full ask() — retrieve + Claude generate | ~1.8s |

Dense latency is almost entirely the OpenAI API round-trip for embedding the query. The 81 corpus embeddings cost ~$0.0004 total to precompute and are cached. Generation dominates total latency, retrieval isn't the bottleneck.

## What I'd do differently at production scale

These are deliberate scope cuts, not oversights:

- Schema validation (pydantic) + retry on malformed extractions, not just a single-shot call
- Chunking at paragraph level with overlap for longer source documents
- A proper vector index (FAISS/pgvector) once the corpus grows past ~10k vectors
- More cases in the eval set, rank-aware metrics (MRR/NDCG) not just hit@k
- Rate limiting, logging, monitoring of real queries and costs

## Related

- [[building-rag-pipelines]] — the theory behind the retrieval choices here
- [[logistic-regression-intuition]] — same Cambridge module context, similar "understand the maths before the library" approach
