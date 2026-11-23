# Measuring the Impact of Personalized Recommendations — Netflix

*Source: [Netflix Technology Blog](https://netflixtechblog.com/measuring-the-impact-of-personalized-recommendations-4c26be3a4d96) — Zielnicki, Aridor, Bibaut, Tran, Chou & Kallus (2026). Published in the International Journal of Industrial Organization.*

## My notes

The connection to [[retention-futility]] is immediate — both papers are wrestling with exactly the same underlying problem: you can't measure the value of a targeted action without knowing what would have happened without it. Ascarza calls this the counterfactual problem for churn interventions; Netflix call it the measurement challenge for recommendations. Same epistemics, different domain.

The decomposition into exposure, selection, and targeting is what I find most interesting. It maps almost exactly to the Ascarza four-segment framework:

- **Selection** = Sure Things — the member was already going to watch that title; the recommendation just found them. No incremental value.
- **Exposure** = general discovery — the title was surfaced and the person gave it a go, but it's not personalised to them specifically.
- **Targeting** = Persuadables — the right title to the right person at the right moment, in a way that changes the decision. This is the only channel generating real incremental value.

Netflix's finding that targeting is nearly seven times larger than exposure in the current system is essentially saying: the value of their recommender isn't that it shows people things, it's that it shows the *right* people the *right* things. That's the same insight Ascarza is pushing for in retention — stop asking "who is likely to churn?" and start asking "who will respond to the intervention?"

The validation approach is worth noting because this is genuinely hard. They couldn't turn off personalisation to measure it (poor UX at scale), so they did small nudge experiments and checked whether the model predicted those substitution patterns correctly. 0.86 correlation / R² of 0.73 is a strong result. The analogy in retention modelling would be: run a small holdout experiment, check whether your uplift model predicts the diversion correctly, then trust it at scale.

The mid-popularity finding is also intuitive once you see it — very popular titles don't need personalisation (everyone finds them), very niche ones have too small an audience to target effectively, the sweet spot is the middle of the catalogue. At Vodafone the equivalent would be: neither the obviously-about-to-churn customer nor the rock-solid loyal one is where uplift modelling adds value. The Persuadables are always somewhere in the middle.

---

## The measurement challenge

Recommendations are not randomly assigned — a title appears on a homepage because the system already predicts the member might want it. So when a member watches a recommended title, did the recommendation *cause* the watch, or would they have watched it regardless? Simply measuring "share of viewing that came from recommendations" conflates the two.

The obvious fix — turning off personalisation entirely and running an A/B test — would create a genuinely worse member experience. Netflix's solution: a **hybrid approach**. Build a large behavioural model that separates underlying preferences from the incremental recommendation effect, then validate that model against small-scale randomised nudge experiments.

## The model

A **low-rank choice model** that learns:

- A representation of each title's characteristics (not just genre/cast — learned from viewing patterns)
- A representation of each member's *current* preference state (dynamic, updated from recent viewing history)
- An explicit **recommendation bonus** parameter — when a title is surfaced, it gets a measured additional probability bump

This setup lets Netflix simulate counterfactuals: what would viewing look like if recommendations were replaced with random, popularity-based, or matrix factorisation outputs?

**Validation:** Small nudge experiments that exogenously shifted some title visibility. The model's predicted diversion ratios matched the experimental results with **correlation 0.86 / R² = 0.73** — strong out-of-sample evidence.

## Counterfactuals: how much does personalisation matter?

Compared to the current system:

| Alternative | Engagement drop |
|---|---|
| Random recommendations | −16% |
| Popularity-based | −12% |
| Matrix factorisation | −4% |

Personalization also **maintains catalogue breadth** — popularity-based and matrix factorisation systems concentrate viewing on fewer titles. Random slightly increases diversity but at massive engagement cost. The current system is the only one that achieves both.

## Decomposing the recommendation effect

Three channels explain why recommended titles get watched:

| Channel | What it means | Relative contribution |
|---|---|---|
| **Exposure** | Surfacing a title at all — any surface, personalised or not, would do this | Small (~7% of gap) |
| **Selection** | Showing it to members who were already likely to watch | Large |
| **Targeting** | Showing it to the members for whom the recommendation *changes* the decision | Largest — ~7× exposure |

As systems improve from random → matrix factorisation → current Netflix:
- Random: dominated by exposure (you're shown things, some stick)
- Matrix factorisation: exposure, selection, and targeting contribute roughly evenly
- Current: increasingly dominated by targeting — getting the right title to the right member

**Mid-popularity titles** see the strongest lift. Very popular titles are found anyway; very niche titles have too small an audience to target effectively. The sweet spot is the middle of the catalogue.

## Related

- [[retention-futility]] — same causal inference challenge in a retention context; the targeting/exposure/selection decomposition maps directly onto Ascarza's four-segment framework
- [[logistic-regression-intuition]] — the measurement problem here is about counterfactuals, not about how the model fits — a reminder that model accuracy ≠ model usefulness
- [[monzo-data-mesh]] — at scale, understanding *which* outputs your system is producing (targeting vs selection vs exposure) requires the same infrastructure discipline as Monzo's interface contracts
