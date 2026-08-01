# Monzo's "Meshy" Data Mesh — Governed Scale at 12,000 dbt Models

*Source: [Monzo Engineering Blog](https://monzo.com/blog/a-meshy-approach-to-data)*

## My take

What I find genuinely clever about the Monzo approach is that the governance structure isn't a policy document that sits next to the code — it's *embedded in the code*. The architecture makes model creation inherently compliant, not retrospectively audited. You can't declare a model as a cross-team interface without writing the `access: public` declaration, the owner team, the SLA, and the schema contract into the YAML. The governance materialises as a side effect of building the model correctly.

This is essentially the [Open Knowledge Format](https://okfn.org/) principle applied to dbt models. OKF (championed by the Open Knowledge Foundation, with Google as a major contributor) is the idea that data assets should be described by open, human-readable, machine-parseable metadata attached directly to the asset — not buried in a separate catalogue or a wiki page that goes stale. dbt's `schema.yml` is that, for SQL models in a warehouse.

Here's what a governed interface model actually looks like in practice:

```yaml
# models/logical/accounts/schema.yml
version: 2

models:
  - name: dim_accounts_v1
    description: "Governed public interface for active and closed Monzo user accounts."

    # --- DATA MESH & GOVERNANCE METADATA ---
    access: public                 # Exposes this model cross-team (interfaces are 'public')
    config:
      contract:
        enforced: true             # Hard enforcement: schema changes break CI if non-compliant
      meta:
        owner_team: "core_banking" # Domain ownership
        tier: "logical"            # Architectural layer (Normalised or Logical)
        sla: "06:00 UTC"           # Freshness expectation

    # --- COLUMN DEFINITIONS & CONSTRAINTS ---
    columns:
      - name: account_id
        data_type: string
        description: "Unique surrogate key for the account."
        constraints:
          - type: not_null
          - type: primary_key
        tests:
          - unique
          - not_null
```

The moment you write `access: public` and `contract: enforced: true`, dbt's CI will break on any downstream model that references this without the contract being met. Governance isn't a review step — it's a build-time constraint.

I see something similar at Vodafone, where data tables carry attached metadata documents explaining ownership, data classification, and retention policy. The friction there is that those documents live separately from the tables themselves, so they drift. The Monzo/OKF insight is: put the metadata in the same file as the model, in the same git commit, under the same CI check. Then it can't drift.

---

## What Monzo actually built

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

Any normalised or logical model can be declared as an **interface**: a contractual data product that other teams are allowed to depend on. Only declared interfaces can be referenced cross-team. Everything else is considered internal implementation detail.

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

## Related

- [Building RAG Pipelines](building-rag-pipelines.md) — the landing → normalised → logical pattern maps directly onto extraction → chunking → embedding in a RAG stack
- [MarkItDown Token Efficiency](markitdown-token-efficiency.md) — tooling that sits in the landing/extraction layer before data reaches the LLM
