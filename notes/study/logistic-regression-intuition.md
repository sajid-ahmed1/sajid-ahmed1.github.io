# Logistic regression: the intuition I wish I'd had first

Logistic regression is a **linear model wearing a curvy coat**. The linearity is in the log-odds; the curve is just the sigmoid squashing it into a probability.

## The chain of ideas

- We want a probability $p \in (0, 1)$.
- A linear model outputs anything in $(-\infty, \infty)$.
- So we model the **log-odds** linearly:

$$\log \frac{p}{1-p} = \beta_0 + \beta_1 x_1 + \dots + \beta_n x_n$$

- Invert it and you get the sigmoid: $p = \dfrac{1}{1 + e^{-z}}$.

## Why this is satisfying

Each coefficient $\beta_i$ is the change in **log-odds** per unit of $x_i$. Exponentiate it and you get an **odds ratio** — a number you can actually explain to a stakeholder.

## Things I keep forgetting

- It's fit by maximum likelihood, not least squares.
- Decision boundary is still *linear* in feature space.
- Accuracy is a trap on imbalanced data — reach for precision/recall first.

Cross-reference: the eval mindset here feeds straight into [[building-rag-pipelines]].
