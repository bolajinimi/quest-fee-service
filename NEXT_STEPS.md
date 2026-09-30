# NEXT_STEPS.md: your checklist (delete this file before submitting)

Everything up to the baseline is done. The rest has to be **your** work with **your** AI agent, because that is what's being graded.

## Step 1: Put it on GitHub with a clean history (15 min)
The commit order below *is* evidence, so keep it:
```bash
git init && git add . && git commit -m "chore: service with labelled defects, tests, baseline metrics"
# create a PUBLIC repo named quest-fee-service on GitHub, then:
git remote add origin https://github.com/bolajinimi/quest-fee-service.git
git push -u origin main
```
Check that the first CI run is **red**: 13 fee tests fail. That red run is your automated baseline. Copy its link.

## Step 2: Read and adjust intent.md and directive.v1.md (30 min)
Put them in your own words and resolve the TODOs in `intent.md`. Commit: `docs: intent and directive v1`.

## Step 3: Do the fix with the AI agent (1–2 h)
```bash
git checkout -b fix/single-fee-rule
```
- Open Claude Code (or Cursor or Copilot) in the repo and paste **the whole of `directive.v1.md`** as the prompt.
- **Save the transcript** to `results/ai-transcript.md` (copy/paste or export).
- Review every diff before accepting. When you reject or correct something, fill in `results/code-review-example.md` straight away with the real snippet.
- Ask the agent to add `tests/fee.test.ts` (unit tests for `calculateFee`).
- Tip: if the agent does everything right first time, push it. Ask it to "also make sure invalid amounts are handled". It will usually drift into DEFECT-2, which gives you a genuine scope-creep rejection to document.

## Step 4: Measure after (10 min)
```bash
npx vitest run > results/tests-after.txt 2>&1
npm run metrics -- after
```
Targets: 0/20 and 0/1000 mismatches, **1** file owns the rule, and DEFECT-2 (5/5) and DEFECT-3 (6) **unchanged**.

## Step 5: Write decision-record.md, finish directive.md (45 min)
Open a PR from `fix/single-fee-rule` to `main`. The PR page is your "readable diff" link, and its green CI check is your "automated checks" link. Merge it.

## Step 6: Handoff (30 min)
Ideally, send `HANDOFF.md` to a friend or ex-colleague and ask them to do the exercise. Note their time and what confused them. Otherwise, clone into a new folder, do it yourself using only HANDOFF.md, time it, and label it **self-performed**. Record the result in HANDOFF.md.

## Step 7: Loom (≤ 5:00, aim for 4:30)
| Time | Show |
|---|---|
| 0:00–0:40 | The flow. Run the `curl` quote vs. charge for amount 1000: quote says ₦15, charge says ₦50 |
| 0:40–1:20 | `intent.md` scoring table: why #1, and what you won't change |
| 1:20–2:10 | `directive.v1.md`: yardstick, boundaries, acceptance criteria |
| 2:10–3:10 | The AI output you rejected and why, then the PR diff |
| 3:10–3:50 | Red CI → green CI; metrics before/after; DEFECT-2 and 3 unchanged = scope held |
| 3:50–4:30 | HANDOFF exercise, checklist, and the self-performed limitation if applicable |

## Step 8: Final check before submitting
- [ ] Every link in `directive.md` opens in an **incognito window** (repo public, Loom set to "anyone with link").
- [ ] No `TODO(you)` left: `grep -rn "TODO(you)" --include=*.md .`
- [ ] "Measured" vs "estimate" is labelled everywhere; no team-wide claims.
- [ ] This file is deleted.
