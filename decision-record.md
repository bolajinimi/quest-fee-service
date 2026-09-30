# Decision record 001: Where the fee rule lives

**Status:** TODO(you): Accepted · **Date:** TODO · **Decider:** Olatunji Clement

## Context
The fee rule was implemented three times (quote, charge, receipt) with different rounding and minimum handling. Measured locally: 13/20 fixed cases mismatched, and 3 files had to be edited to change the rule. See `intent.md`.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. One pure function `calculateFee(amount)` in `src/lib/fee.ts`** | Smallest diff; trivially unit-testable; no new concepts | Rate is still a code constant, so changing it needs a deploy |
| B. A `FeeService` class injected into routes | Easier to swap per-offering fees later | More structure than one rule needs today; bigger diff; harder to review |
| C. Config-driven rule (rate and minimum from env/JSON) | Change the fee without a code change | Adds config validation and a new failure mode; the rule is rarely changed; out of scope |
| D. Leave three copies and add a test that they agree | No refactor | Keeps the maintenance cost (still 3 edits); it only detects drift after the fact |

## Decision
TODO(you): expected **Option A**. Write 2–3 sentences in your own words.

Also decided: **the receipt reads the stored `fee`/`total`** instead of recalculating. A receipt must show what was charged, even if the rule changes later.

## Trade-offs accepted
- Changing the rate still needs a code change and a deploy (acceptable: rare, and it goes through review).
- Integer-kobo maths adds a conversion step (`toKobo`) that readers need to understand. This is mitigated by a comment and unit tests.

## Consequences / follow-ups
- DEFECT-2 (validation) should be the next change. `calculateFee` assumes a positive, finite amount.
- If per-offering fees arrive, revisit Option B.
