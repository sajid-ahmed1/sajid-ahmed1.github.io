# Building RAG pipelines that actually retrieve

> Working notes. Updated as I break things and fix them.

Retrieval-Augmented Generation lives or dies on **retrieval**, not generation. Most of the time a "bad LLM answer" is really a bad context window.

## The parts that matter

1. **Chunking** — too big and you dilute the signal; too small and you lose context. I default to ~500 tokens with ~50 token overlap, then tune.
2. **Embedding model** — the retriever's eyes. A domain-tuned model beats a bigger general one more often than people expect.
3. **Re-ranking** — cheap win. Pull top-50 with vector search, then re-rank to top-5 with a cross-encoder.

## Why naive cosine search disappoints

Cosine similarity rewards *topical* overlap, not *answer* relevance. A chunk can be about the right topic and still not contain the answer. Hybrid search (BM25 + dense) plus a re-ranker fixes most of this.

```python
results = vector_store.search(query, k=50)
reranked = cross_encoder.rank(query, results)[:5]
context = "\n\n".join(c.text for c in reranked)
```

## Open questions

- When is fine-tuning cheaper than better retrieval?
- How do I evaluate retrieval without a labelled set?

See also: [[logistic-regression-intuition]] for the eval-metrics mindset.
