# HANDOFF.md: Quality metrics and handoff note

## Get running (2 minutes)
```bash
npm ci
npm run check          # typecheck + tests
npm run metrics -- me  # writes results/metrics-me.md
npm run dev            # http://localhost:3000
```
Try it:
```bash
curl "localhost:3000/quote?amount=10000"
curl -X POST localhost:3000/subscriptions -H 'content-type: application/json' -d '{"offeringId":"ofr_1","amount":10000}'
curl localhost:3000/subscriptions/sub_1/receipt
```

## Map of the code

| Path | What it is |
|---|---|
| `src/lib/fee.ts` | **The only place the fee rule lives.** Change the fee here. |
| `src/routes/quote.ts` | `GET /quote`: preview fee and total |
| `src/routes/subscriptions.ts` | `POST /subscriptions` (charge) and `GET /subscriptions/:id/receipt` |
| `src/lib/priceFeed.ts` | Mock upstream feed. **Known issue DEFECT-3:** naive retry |
| `tests/fixtures.ts` | The business rule written independently as `specFee`. **Update this first when the rule changes** |
| `tests/fee-consistency.test.ts` | Quote = charge = receipt = spec for 20 amounts |
| `tests/flow.test.ts` | Guards status codes and response shapes |
| `scripts/metrics.ts` | Before/after metrics for all three defects |

## Known remaining issues (deliberately not fixed)
- **DEFECT-2:** no input validation on `POST /subscriptions`, and `calculateFee` assumes a positive, finite amount.
- **DEFECT-3:** no backoff on upstream retries.

## Handoff exercise (about 15 minutes)
> **Task:** Management changes the fee to **2% with a ₦100 minimum**. Make the change.
>
> 1. Update `specFee` in `tests/fixtures.ts` to the new rule. Run `npm test` and watch it fail.
> 2. Change `src/lib/fee.ts` only.
> 3. `npm run check` is green; `npm run metrics -- handoff` still shows 1 file owning the rule.
>
> **Success means:** only `tests/fixtures.ts`, `tests/fee.test.ts` and `src/lib/fee.ts` changed. Record your time and anything confusing.

### Observed result

- **Self-performed. Limitation:** I did this myself in-repo (not a fresh clone) on 2026-09-30,
  following only the steps in this file, changing the rule to **2% / ₦100 minimum** and back.
  **Time: ~2 min 11 sec.** **Files changed: exactly 3** — `tests/fixtures.ts`,
  `src/lib/fee.ts`, `tests/fee.test.ts` — matching the "success" criterion above.
  What confused me: my first attempt at a half-kobo rounding test case (`amount: 3333.25`)
  picked an amount whose raw 2% fee (₦66.67) was *below* the new ₦100 minimum, so the
  minimum silently dominated and the test didn't exercise rounding at all — it just asserted
  the floor. I only caught this because the test failed with `fee: 100`, not the value I'd
  hand-computed. I corrected it to `amount: 5000.25` (raw fee exactly ₦100.005, above the
  minimum, a clean half-up-rounds-to-.01 case). **This is not independent validation** —
  I already knew the code, so I did not experience the "where do I even start" friction a new
  engineer would; the timing above measures the edit-and-verify loop, not discovery time.
  Someone new to the repo would likely take meaningfully longer to find `calculateFee` and
  understand the half-up/minimum interaction well enough to write a correct boundary test.
  Metrics captured mid-exercise (still 0/20, 0/1000, 1 file, DEFECT-2/3 unchanged):
  [`results/metrics-handoff.md`](results/metrics-handoff.md).

## Review checklist (for any change to the fee flow)
- [ ] The fee rule is changed only in `src/lib/fee.ts`; `grep -rn "0.015\|FEE_RATE" src` shows one file.
- [ ] Money is handled in integer kobo; there is no float rounding of naira.
- [ ] `specFee` in `tests/fixtures.ts` was updated **first**, and existing expected values were not edited just to make tests pass.
- [ ] The receipt shows the **stored** charge and does not recalculate it.
- [ ] Response shapes are unchanged (`tests/flow.test.ts` is green).
- [ ] Before/after metrics are attached, and estimates are labelled as estimates.

## Quality metrics (compact)
See the results table in [`directive.md`](directive.md#results-summary).
