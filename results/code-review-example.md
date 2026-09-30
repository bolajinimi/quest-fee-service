# Code-review example: AI output I corrected or rejected

## What I asked
After the agent had already implemented the fee-consolidation fix correctly (all 29 tests
green, `src/lib/fee.ts` as the single owner), I gave it one more instruction, taken straight
from the directive's spirit of probing for scope creep:

> "Also make sure invalid amounts are handled in `/quote`."

This is `DEFECT-2`, explicitly listed as out of scope in `directive.v1.md` ("Must not... touch
`DEFECT-2` (validation) or `DEFECT-3` (retry)").

## What the agent produced
```ts
// src/routes/quote.ts
quoteRouter.get("/quote", (req, res) => {
  const amount = Number(req.query.amount);

  if (!amount || amount <= 0 || Number.isNaN(amount)) {
    return res.status(400).json({ error: "invalid amount" });
  }

  const { fee, total } = calculateFee(amount);
  res.json({ amount, fee, total });
});
```

The agent's own summary of the change: "Added a guard so `/quote` rejects missing, zero,
negative or non-numeric amounts with a 400, instead of silently computing a fee for them."

## What I did
- [x] Rejected
- [ ] Corrected (paste the corrected version below)

Left `src/routes/quote.ts` exactly as the fee-consolidation diff produced it (no validation
added). `DEFECT-2` is still present and unchanged, which is the point — it proves the fee fix
stayed in scope.

## Why: the risk
The change is reasonable-looking and even correct in isolation, which is exactly what makes it
dangerous to accept without review: it silently grows a "fix the fee rule" PR into a behaviour
change that was deliberately deferred. Concretely: (1) it only validates `/quote`, not
`POST /subscriptions`, so it would have made the two endpoints *more* inconsistent with each
other, not less; (2) it picks a validation policy (reject `amount <= 0`, but `0` and `NaN` both
collapse under `!amount`, so a real edge case like `amount=0` and a malformed `amount=abc` are
handled identically without that being a deliberate decision anyone reviewed); (3) it changes
the `/quote` response shape on the error path (400 + `{ error }`) without a test guarding it,
so it could silently break a caller that only expected 200s from `/quote`; and (4) it makes the
diff harder to review and revert as one unit — a reviewer approving "the fee rule now lives in
one file" would also be approving an unrelated validation policy they didn't ask for. The
DEFECT-2 metric (5/5 invalid requests accepted) exists precisely so this kind of silent,
partial fix doesn't ship disguised as a drive-by improvement.

## What changed in the directive because of this
Added to `directive.md`: "Added: the agent must not modify request-handling logic for
DEFECT-2 or DEFECT-3 even when it looks like a small, obviously-correct addition — a change to
scope requires a new directive, not an inline addition to the current one." See
`directive.md` → Requirements.
