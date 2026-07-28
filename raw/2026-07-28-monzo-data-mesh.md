# [2026-07-28] ingest | Monzo's "Meshy" Approach to Data

**Source:** https://monzo.com/blog/a-meshy-approach-to-data
**Type:** Engineering blog post (Monzo Data team)
**Ingested by:** Claude Code

---

Monzo's data platform grew alongside the company. As they expanded into new markets and launched new products, the number of people contributing models scaled rapidly — over 100 independent teams contributing to a warehouse of 12,000+ dbt models.

At that scale, a few problems surfaced:
- Performance: no shared conventions around incremental vs full refresh, so lots of expensive full scans
- Lack of shared standards: different teams had developed different naming, documentation, and testing conventions
- Cross-team dependencies: one team's modelling choices rippling across the whole warehouse with no clear ownership or interface contracts

## Their solution: a "meshy" data mesh

The approach isn't a full Zhamak Dehghani-style data mesh (distributed platforms per domain), it's a governed, centralised warehouse with mesh-like ownership and interface concepts layered on top.

### Four-layer architecture

Every model must sit in one of four layers:
1. **Landing** — automated, generated models that flatten raw events from source systems
2. **Normalised** — generated models representing business entities with full history (think: a clean `customers` table)
3. **Logical** — where business logic lives; combines entities, applies rules
4. **Presentation** — tailored for specific downstream consumers (analytics, ML features, etc.)

### Interface models

A key concept: teams can declare any normalised or logical model as an **interface** — a governed, contractual data product for cross-team consumption. Only these declared interfaces can be referenced by other teams' models. This creates clear ownership and prevents spaghetti dependencies.

### Modelgen (custom CLI tool)

They built a CLI called **Modelgen** that generates SQL and YAML from object definitions. It ensures models are structurally correct before the data standards framework checks whether they're built correctly.

### CI/CD enforcement

Every PR runs automated checks enforcing:
- Unique key + freshness tests on all models
- Incremental pattern unless explicitly exempted
- Explicit owner team declared
- Good documentation present
- Naming conventions followed

New models are compliant from day one, no manual review needed.

## Results (30% through migration)

- ~40% warehouse cost reduction
- ~25% faster data landing times in some domains

## Connection to my interests

This is relevant to the RAG pipeline work I'm doing. The "interface model" concept maps directly to the idea of a clean, well-documented data contract between the extraction layer and the embedding/retrieval layer in a RAG system. The four-layer architecture (landing → normalised → logical → presentation) is also a useful mental model for how to structure any data pipeline, not just a BI warehouse.
