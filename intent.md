# intent.md: Why I chose this problem

**Author:** Olatunji Clement · **Date:** 2026-09-30 · **Repo:** [github.com/bolajinimi/quest-fee-service](https://github.com/bolajinimi/quest-fee-service)

## The flow

One user-facing flow in a small Node/TypeScript service: an investor **quotes** a subscription (`GET /quote`), **subscribes** (`POST /subscriptions`), and views a **receipt** (`GET /subscriptions/:id/receipt`).

Business rule: **fee = 1.5% of amount, rounded half-up to the kobo, minimum ₦50; total = amount + fee.**

The service was built for this exercise. Three quality problems were introduced on purpose and are labelled `DEFECT-n` in the code.

## Three candidate problems (baseline measured locally, 2026-09-30)

| # | Problem | Where | Baseline (measured) |
|---|---|---|---|
| 1 | **Duplicated fee logic.** The fee rule is copied three times with different rounding, and one copy forgets the minimum | `routes/quote.ts`, `routes/subscriptions.ts`, `lib/receipt.ts` | 13/20 fixed cases and 995/1,000 sweep amounts disagree across quote, charge and receipt; **3 files** to edit to change the rule |
| 2 | **Missing validation.** Negative, zero, non-numeric or missing amounts are accepted | `routes/subscriptions.ts` | 5/5 invalid requests accepted (HTTP 201) |
| 3 | **Naive retry.** 6 back-to-back upstream calls with no backoff when the feed fails | `lib/priceFeed.ts` | 6 upstream calls per user request while the feed is down |

Source: [`results/metrics-baseline.md`](results/metrics-baseline.md) and [`results/tests-baseline.txt`](results/tests-baseline.txt).

## How I prioritised

Scored 1 (low) to 5 (high). Operating cost means the ongoing cost of leaving it as is: support load, upstream load, and time spent investigating incidents.

| # | User impact | Maintenance effort (cost of leaving it) | Operating cost | Total | Risk of fixing |
|---|---|---|---|---|---|
| 1 Duplicated fee logic | **5**: the user is quoted one price and charged another, and the receipt disagrees again. That is a trust problem in a money flow | **5**: every fee change means editing 3 places consistently, and it has already drifted | **4**: disputes and reconciliation work for every mismatched charge | **14** | Low: pure function, easy to test |
| 2 Missing validation | 4: bad data stored, but a normal user rarely hits it through a UI | 2: a single boundary check | 3: bad records need clean-up | 9 | Low |
| 3 Naive retry | 2: only during upstream outages | 2: one function | 4: multiplies load on an already failing dependency | 8 | Medium: timing behaviour is harder to test well |

**Decision: fix #1.** It is the only problem that hurts every user on the happy path, and it is the one most likely to keep getting worse, because every future fee change multiplies the drift. It also gives a clear correctness check (spec vs. quote, charge and receipt) and a clear maintainability measure (files you must edit to change the rule).

Author's own words: I prioritize payment-calculation failures because I have seen how a small business-rule gap can survive into a live product and create incorrect transaction outcomes. At Sage-GreyTech, I found that Paystack was applying its transaction percentage when principals paid prizes for completed tasks, while our own application was failing to apply the additional percentage defined by the product rules. I traced the discrepancy to the backend logic, implemented the missing calculation, and verified that the resulting payment flow reflected the intended rule.

## What I will NOT change

- Input validation (DEFECT-2) and retry behaviour (DEFECT-3). They are documented and left for follow-up tickets.
- The API routes and the JSON response shapes (guarded by `tests/flow.test.ts`).
- Storage (the in-memory store), the framework, and dependencies. No new packages.
- The business rule itself (1.5%, ₦50 minimum, half-up). I am making the code match the rule, not changing the rule.

## What "done" looks like

- 0/20 fixed and 0/1,000 sweep mismatches; all existing flow tests still pass; typecheck is clean in CI.
- The fee rule lives in exactly **one** file.
- DEFECT-2 and DEFECT-3 metrics are **unchanged**, which proves the change stayed in scope.
