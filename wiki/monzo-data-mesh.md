# Monzo's "Meshy" Data Mesh — Governed Scale at 12,000 dbt Models

*Source: [Monzo Engineering Blog](https://monzo.com/blog/a-meshy-approach-to-data)*

Monzo's data platform grew to over 100 teams contributing 12,000+ dbt models. At that scale, what works for a small team becomes actively harmful — expensive full-table scans, inconsistent naming, no clear ownership of shared tables, and cross-team changes silently breaking downstream consumers. This post is their answer.

## The core idea

They don't call it a strict data mesh (à la Zhamak Dehghani's original paper). They call it "meshy" — a centralised warehouse with mesh-like ownership and interface contracts layered on top. Each team owns its models, but there are shared standards and explicit, governed contracts for anything consumed cross-team.

## Four-layer architecture

Every model belongs to one of four layers — this is non-negotiable and enforced in CI:

| Layer | What it is |
|---|---|
| **Landing** | Auto-generated; flattens raw events straight from source systems |
| **Normalised** | Generated entity tables with full history (e.g. a clean `customers` model) |
| **Logical** | Where business logic lives; joins entities, applies rules |
| **Presentation** | Tailored for a specific consumer — an analytics dashboard, an ML feature store, etc. |

The key discipline is that each layer only reads from the layer above it. No jumping from Presentation to Landing. No spaghetti.

## Interface models — the mesh part

This is the idea I find most interesting. Any normalised or logical model can be declared as an **interface**: a contractual data product that other teams are allowed to depend on. Only declared interfaces can be referenced cross-team. Everything else is considered internal implementation detail.

It's the same principle as a well-defined API surface in software engineering — you control what's public, and you own the guarantee that it won't silently break.

## Modelgen — generated structure

They built a custom CLI called **Modelgen** that generates SQL and YAML from object definitions. Instead of hand-writing boilerplate dbt model files, you define an object and let Modelgen scaffold the correct structure, tests, and metadata. Structure is guaranteed correct before it even hits CI.

## CI enforcement

Every pull request runs automated checks:
- Unique key + freshness tests present on all models
- Incremental processing (not full refresh) unless explicitly exempted
- Owner team declared
- Documentation present
- Naming conventions followed

New models are compliant from day one with no manual review gate. The reviewer's job shifts from "is this built correctly?" to "is this the right thing to build?"

## Results so far

They're ~30% through a company-wide migration. Early numbers:
- **~40% warehouse cost reduction** in migrated domains
- **~25% faster data landing times** in some domains

## Why this matters beyond fintech

The four-layer model and the interface concept are broadly applicable. In any large-scale data pipeline — including RAG systems — the same tensions exist: who owns the clean entity layer, what's the contract between the extraction and the retrieval layer, and how do you prevent one team's change from silently degrading another team's quality. This is just those questions solved at warehouse scale.

## Related

- [Building RAG Pipelines](building-rag-pipelines.md) — the landing → normalised → logical pattern maps directly onto extraction → chunking → embedding in a RAG stack
- [MarkItDown Token Efficiency](markitdown-token-efficiency.md) — tooling that sits in the landing/extraction layer before data reaches the LLM
