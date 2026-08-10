# Retention Futility — Targeting High-Risk Customers Might Be Ineffective

*Source: Ascarza (2018), Journal of Marketing Research — [paper PDF](https://www.hbs.edu/ris/Publication%20Files/ascarza_jmr_18_783d54d4-e548-41ed-b1d7-8a180f1ae85a.pdf)*

## My notes

From speaking to people at Vodafone, I think this is exactly what happens in practice: the churn model scores customers on risk, the customer value team gets a list, and they target those people with ads or retention offers. Nobody questions whether the people at the top of that list are actually *movable* by the intervention. The assumption is that reaching high-risk churners is the right goal. This paper says that assumption is the whole problem.

The sleeping dogs insight is the one that surprised me most. My first instinct was "obviously alert people before they churn" — but think about car insurance. If the direct debit just keeps going, most people never check quotes. The reminder that the renewal is due is what triggers them to shop around. The intervention causes the churn it was trying to prevent. You'd never see that in the data without a proper holdout group — you'd just see "we contacted these customers and 15% churned anyway" without realising some of them would have stayed if you'd left them alone.

The hard part of fixing this isn't the modelling — it's the business change. To run uplift models, you need a randomised holdout group: customers you deliberately don't contact, so you can measure the counterfactual. That means convincing someone to leave money on the table today (a control group who might churn without an offer) to build a better model tomorrow. And before you can even have that conversation, you have to explain why the current approach is broken — which means telling a team whose KPIs are "retained customers" that some of those retained customers would have stayed regardless. The numbers they're celebrating are partly a fiction.

---

## The core argument

Traditional churn modelling answers: *who is most likely to leave?*

Ascarza argues that the intervention budget should answer a different question: *who will change their behaviour because I spent money on them?*

Those two populations barely overlap.

## The four segments

Any customer receiving a retention intervention falls into one of four cells:

| | **Likely to churn** | **Unlikely to churn** |
|---|---|---|
| **Responds to intervention** | **Persuadables** ✅ | Sure Things (wasted spend) |
| **Doesn't respond** | Lost Causes (wasted spend) | **Sleeping Dogs** ⚠️ |

- **Persuadables** — the only segment worth spending on. High risk and the intervention actually works.
- **Sure Things** — would stay anyway. Money spent here does nothing.
- **Lost Causes** — will churn regardless of what you do. Most traditional churn targeting lands here.
- **Sleeping Dogs** — would have stayed if you left them alone, but the intervention triggers them to leave. Negative ROI.

## Uplift modelling — the fix

Instead of predicting P(churn | features), estimate the **individual treatment effect**: how much more likely is this customer to stay *because* of the intervention, versus the counterfactual where you do nothing?

This requires:
- A randomised holdout group (control arm) to estimate the counterfactual
- Uplift models (CATE estimation) rather than standard outcome prediction

The output isn't a churn score — it's a *responsiveness score*. You target the people at the top of the responsiveness ranking, not the churn probability ranking.

## The finding

In empirical tests, targeting by churn score performs **no better than random** in terms of actual retention lift. Apparent successes conflate three things:
1. Persuadables who genuinely responded to the offer
2. Lost Causes who churned anyway
3. Sure Things who'd have stayed regardless and made the numbers look good

Uplift-scored targeting significantly outperforms random targeting in the same experiments.

## Related

- [[logistic-regression-intuition]] — the classic churn model is logistic regression; this paper challenges what you should be *predicting*, not how to predict it
- [[monzo-data-mesh]] — the same discipline of asking "are we measuring the right thing?" before optimising applies across data products at scale
