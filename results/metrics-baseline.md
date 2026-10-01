# Metrics: baseline

Measured locally (2026-09-30T20:12:10.620Z, Node v22.22.2) against the in-process app.
These are **measured values from a local test**, not production or team-wide figures.

| Defect | Metric | Value |
|---|---|---|
| 1. Duplicated fee logic | Fixed cases where quote/charge/receipt disagree with spec | 13 / 20 |
| 1. Duplicated fee logic | Sweep (1,000 seeded amounts) mismatches | 995 / 1000 |
| 1. Duplicated fee logic | Source files containing a copy of the fee rule | 3 (src/lib/receipt.ts, src/routes/quote.ts, src/routes/subscriptions.ts) |
| 2. Missing validation | Invalid requests accepted (201) | 5 / 5 |
| 3. Naive retry | Upstream calls per user request while feed is down | 6 |
| 3. Naive retry | Time for 10 failing requests | 17 ms |

## Example fee mismatches (first 5 of fixed cases)

| amount | spec | quote | charged | receipt |
|---|---|---|---|---|
| 100 | 50 | 1.5 | 50 | 50 |
| 1000 | 50 | 15 | 50 | 50 |
| 2500 | 50 | 37.5 | 50 | 50 |
| 3333.34 | 50 | 50 | 50 | 50.01 |
| 3336.66 | 50.05 | 50.05 | 50.04 | 50.05 |
