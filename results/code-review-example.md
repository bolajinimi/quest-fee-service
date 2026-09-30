# Code-review example: AI output I corrected or rejected

> TODO(you): this file must describe something that **really happened** during your AI session.
> Paste the real snippet. Do not invent one; reviewers can tell, and it is the part of the rubric that proves the workflow is real.
> Below is the structure, plus the kinds of issues that commonly come up on this task.

## What I asked
Directive v1 (link to the exact commit of `directive.v1.md`).

## What the agent produced
```ts
// TODO(you): paste the exact AI suggestion here
```

## What I did
- [ ] Rejected
- [ ] Corrected (paste the corrected version below)

```ts
// TODO(you): your corrected version, if any
```

## Why: the risk
TODO(you): 3–5 sentences. Name the concrete failure it would have caused.

## What changed in the directive because of this
TODO(you): the line you added to `directive.md` so the next run doesn't repeat it.

---

### Issues to watch for on this task (remove this section before submitting)
- **Floating-point money:** e.g. `Math.round(amount * 0.015 * 100) / 100`. Look at amount 3336.66: truncating and rounding give different kobo.
- **Editing a test so it passes:** changing an expected value in `fee-consistency.test.ts` or `fixtures.ts`. This is the most serious one, because it hides the bug.
- **Scope creep:** adding validation (DEFECT-2) or backoff (DEFECT-3) "while it's there."
- **Receipt still recalculating:** it calls the new function instead of reading the stored charge.
- **Changing the rule:** e.g. dropping the ₦50 minimum because "the quote didn't have it."
