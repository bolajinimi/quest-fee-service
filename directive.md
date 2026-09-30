# directive.md: Final directive (fee-logic consolidation)

> Final version, updated after implementation. v1 is in [`directive.v1.md`](directive.v1.md).
> TODO(you): fill in every TODO, delete this line, and check every link in an incognito window.

## Objective
Quote, charge and receipt must always agree with the business rule (**1.5%, half-up to the kobo, ₦50 minimum**), and the rule must be changeable in one place.

## Scope
- **In:** consolidate the fee rule into `src/lib/fee.ts`; make all three call sites use it; receipt reads the stored charge.
- **Out (deliberately unchanged):** input validation (DEFECT-2), retry/backoff (DEFECT-3), API shapes, storage, dependencies.

## Requirements
Carry over the v1 yardstick and boundaries, plus these changes learned during the work:
- TODO(you): e.g. "Added: agent must not edit files under `tests/` other than creating `tests/fee.test.ts`." This came from the rejected output in the code-review example.
- TODO(you): e.g. "Added: calculations must use integer kobo; a float `Math.round(x * 100) / 100` pattern is not acceptable."

## Completion criteria
- [ ] `npm run check` is green locally and in CI.
- [ ] `metrics-after`: 0/20 and 0/1000 mismatches; 1 file owns the fee rule.
- [ ] DEFECT-2 and DEFECT-3 metrics are identical to baseline (scope held).
- [ ] The decision record, code-review example and handoff note are written.
- [ ] The handoff exercise has been performed and its result recorded.

---

## Appendix: results and handoff

| Evidence | Link |
|---|---|
| Runnable repository | TODO(you): https://github.com/bolajinimi/quest-fee-service |
| Focused diff (one PR) | TODO(you): PR link |
| Automated checks (CI run) | TODO(you): Actions run link |
| Test results before / after | [`results/tests-baseline.txt`](results/tests-baseline.txt) · TODO: `results/tests-after.txt` |
| Quality metrics before / after | [`results/metrics-baseline.md`](results/metrics-baseline.md) · TODO: `results/metrics-after.md` |
| Code-review example (AI output corrected or rejected) | [`results/code-review-example.md`](results/code-review-example.md) |
| Decision record | [`decision-record.md`](decision-record.md) |
| Quality metrics and handoff note | [`HANDOFF.md`](HANDOFF.md) |
| Why this problem | [`intent.md`](intent.md) |
| Loom walkthrough | TODO(you) |

### Results summary
TODO(you): paste from the metrics files.

| Metric | Before | After | Type |
|---|---|---|---|
| Fixed cases with a fee mismatch | 13/20 | TODO | Measured (local) |
| Sweep mismatches (1,000 seeded amounts) | 995/1000 | TODO | Measured (local) |
| Files to edit to change the fee rule | 3 | TODO | Measured (static count) |
| Invalid requests accepted (out of scope) | 5/5 | TODO (should be 5/5) | Measured (local) |
| Upstream calls per failed request (out of scope) | 6 | TODO (should be 6) | Measured (local) |
| Time for a new engineer to change the fee rule | n/a | TODO | Measured once, **self-performed** (see HANDOFF) |
| Fewer fee disputes and support tickets | n/a | n/a | **Estimate only**; not measured, no team-wide claim |
