# directive.md: Final directive (fee-logic consolidation)

> Final version, updated after implementation. v1 is in [`directive.v1.md`](directive.v1.md).

## Objective
Quote, charge and receipt must always agree with the business rule (**1.5%, half-up to the kobo, ₦50 minimum**), and the rule must be changeable in one place.

## Scope
- **In:** consolidate the fee rule into `src/lib/fee.ts`; make all three call sites use it; receipt reads the stored charge.
- **Out (deliberately unchanged):** input validation (DEFECT-2), retry/backoff (DEFECT-3), API shapes, storage, dependencies.

## Requirements
Carry over the v1 yardstick and boundaries, plus this change learned during the work:
- **Added:** the agent must not modify request-handling logic for DEFECT-2 (validation) or
  DEFECT-3 (retry) even when it looks like a small, obviously-correct addition — a change to
  scope requires a new directive, not an inline addition to the current one. This came from
  the rejected output in [`results/code-review-example.md`](results/code-review-example.md):
  when asked to "also handle invalid amounts," the agent produced a plausible-looking 400
  guard on `/quote` that (a) didn't cover `POST /subscriptions`, making the two endpoints more
  inconsistent, and (b) changed a response shape with no test guarding it.

## Completion criteria
- [x] `npm run check` is green locally and in CI.
- [x] `metrics-after`: 0/20 and 0/1000 mismatches; 1 file owns the fee rule.
- [x] DEFECT-2 and DEFECT-3 metrics are identical to baseline (scope held).
- [x] The decision record, code-review example and handoff note are written.
- [x] The handoff exercise has been performed and its result recorded.

---

## Appendix: results and handoff

| Evidence | Link |
|---|---|
| Runnable repository | [github.com/bolajinimi/quest-fee-service](https://github.com/bolajinimi/quest-fee-service) |
| Focused diff (one PR) | [PR #1](https://github.com/bolajinimi/quest-fee-service/pull/1) |
| Automated checks (CI run) | [`ci` / check — passed](https://github.com/bolajinimi/quest-fee-service/actions/runs/36780711219/job/110109964845?pr=1) |
| Test results before / after | [`results/tests-baseline.txt`](results/tests-baseline.txt) · [`results/tests-after.txt`](results/tests-after.txt) |
| Quality metrics before / after | [`results/metrics-baseline.md`](results/metrics-baseline.md) · [`results/metrics-after.md`](results/metrics-after.md) |
| Code-review example (AI output corrected or rejected) | [`results/code-review-example.md`](results/code-review-example.md) |
| Decision record | [`decision-record.md`](decision-record.md) |
| Quality metrics and handoff note | [`HANDOFF.md`](HANDOFF.md) |
| Why this problem | [`intent.md`](intent.md) |
| Loom walkthrough | [Loom video](https://www.loom.com/share/8f892adec3374d34a283a03a1de2b1b9) |

### Results summary

| Metric | Before | After | Type |
|---|---|---|---|
| Fixed cases with a fee mismatch | 13/20 | **0/20** | Measured (local) |
| Sweep mismatches (1,000 seeded amounts) | 995/1000 | **0/1000** | Measured (local) |
| Files to edit to change the fee rule | 3 | **1** (`src/lib/fee.ts`) | Measured (static count) |
| Invalid requests accepted (out of scope) | 5/5 | 5/5 (unchanged — scope held) | Measured (local) |
| Upstream calls per failed request (out of scope) | 6 | 6 (unchanged — scope held) | Measured (local) |
| Time for a new engineer to change the fee rule | n/a | see [`HANDOFF.md`](HANDOFF.md) | Measured once, **self-performed** |
| Fewer fee disputes and support tickets | n/a | n/a | **Estimate only**; not measured, no team-wide claim |
