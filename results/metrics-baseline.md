# Metrics: baseline

Measured locally (2026-10-01T01:18:56.557Z, Node v20.20.2) against the in-process app.
These are **measured values from a local test**, not production or team-wide figures.

| Defect | Metric | Value |
|---|---|---|
| 1. Duplicated fee logic | Fixed cases where quote/charge/receipt disagree with spec | 0 / 20 |
| 1. Duplicated fee logic | Sweep (1,000 seeded amounts) mismatches | 1 / 1000 |
| 1. Duplicated fee logic | Source files containing a copy of the fee rule | 1 (src/lib/fee.ts) |
| 2. Missing validation | Invalid requests accepted (201) | 5 / 5 |
| 3. Naive retry | Upstream calls per user request while feed is down | 6 |
| 3. Naive retry | Time for 10 failing requests | 4 ms |

## Example fee mismatches (first 5 of fixed cases)

_None._
