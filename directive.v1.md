# directive.v1.md: Initial directive for the AI coding agent

> Version 1: written **before** implementation and given to the agent as is.
> Kept unchanged for the record. The final version is [`directive.md`](directive.md).

## Context
- A small Express + TypeScript service with one flow: quote → subscribe → receipt.
- Business rule: **fee = 1.5% of amount, rounded half-up to the kobo, minimum ₦50.00; total = amount + fee.**
- The fee rule is currently implemented three times with different behaviour (search for `DEFECT-1`):
  `src/routes/quote.ts`, `src/routes/subscriptions.ts`, `src/lib/receipt.ts`.
- Tests: `npm test`. Metrics: `npm run metrics -- <label>`. Typecheck: `npm run typecheck`.

## Objective
Make the fee rule live in a single module that all three places use, so that quote, charge and receipt always agree with the business rule.

## Quality yardstick (how the change will be judged)
1. **One owner:** exactly one function implements the fee rule; nothing else contains the rate.
2. **Money is exact:** calculate in integer kobo, not floating-point naira.
3. **Receipts reflect what was charged:** the receipt reads the stored fee instead of recalculating it.
4. **Small diff:** only the files listed below; no drive-by refactors.
5. **Tests prove behaviour:** tests are the spec; they are not edited to pass.
6. **Readable:** a new engineer can find and change the fee rule in under 5 minutes.

## Boundaries
- **May edit:** `src/routes/quote.ts`, `src/routes/subscriptions.ts`, `src/lib/receipt.ts`; **may create:** `src/lib/fee.ts`, `tests/fee.test.ts`.
- **Must not:** change `tests/fixtures.ts`, `tests/fee-consistency.test.ts` or `tests/flow.test.ts`; change routes or response shapes; add dependencies; touch `DEFECT-2` (validation) or `DEFECT-3` (retry).
- If a boundary seems to block the objective, **stop and explain** instead of working around it.

## Acceptance criteria
- `npm run typecheck` passes.
- `npm test` passes, including all 20 cases in `fee-consistency.test.ts`.
- `npm run metrics -- after` shows: 0/20 and 0/1000 mismatches, **1** file containing the fee rule, and the DEFECT-2 and DEFECT-3 numbers **unchanged** from baseline.
- New unit tests in `tests/fee.test.ts` cover: below the minimum, exactly at the minimum boundary, a half-kobo rounding case, and a large amount.

## Review responsibilities
- **Agent:** proposes the diff, runs typecheck, tests and metrics, and pastes the outputs. It lists any assumption it made.
- **Human (me):** checks the rounding against the rule by hand for 3 amounts, checks the diff against the boundaries, rejects any edit to existing tests, and records one corrected or rejected suggestion in `results/code-review-example.md`.
