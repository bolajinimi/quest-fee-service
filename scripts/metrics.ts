/**
 * Before/after quality metrics for all three labelled defects.
 *
 *   npm run metrics -- baseline     -> results/metrics-baseline.{json,md}
 *   npm run metrics -- after        -> results/metrics-after.{json,md}
 *
 * Everything reported here is MEASURED locally on this machine against the
 * in-process app. Nothing here is a production or team-wide number.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { getFeedCalls, resetFeedCalls, setFeedMode } from "../src/lib/priceFeed.js";
import { clearStore } from "../src/lib/store.js";
import { FEE_CASES, specFee, sweepAmounts } from "../tests/fixtures.js";

const label = process.argv[2] ?? "baseline";
const app = createApp();

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

async function feeMismatches(amounts: number[]) {
  clearStore();
  setFeedMode("up");
  let mismatches = 0;
  const examples: Array<Record<string, number>> = [];
  for (const amount of amounts) {
    const q = (await request(app).get("/quote").query({ amount })).body.fee;
    const c = await request(app).post("/subscriptions").send({ offeringId: "ofr_1", amount });
    const r = (await request(app).get(`/subscriptions/${c.body.id}/receipt`)).body.fee;
    const spec = specFee(amount);
    if (q !== spec || c.body.fee !== spec || r !== spec) {
      mismatches++;
      if (examples.length < 5) examples.push({ amount, spec, quote: q, charged: c.body.fee, receipt: r });
    }
  }
  return { cases: amounts.length, mismatches, examples };
}

function feeRuleLocations() {
  // A file "owns a copy of the fee rule" if it contains the 1.5% rate literal
  // or defines a fee-rate constant (e.g. FEE_RATE = ..., FEE_RATE_BPS = ...).
  const hits = listFiles("src")
    .filter((f) => /0\.015\b|\bFEE_RATE\w*\s*=/.test(readFileSync(f, "utf8")))
    .map((f) => relative(".", f));
  return { filesWithFeeRule: hits.length, files: hits };
}

async function invalidInputsAccepted() {
  clearStore();
  setFeedMode("up");
  const bodies = [
    { offeringId: "ofr_1", amount: -5000 },
    { offeringId: "ofr_1", amount: 0 },
    { offeringId: "ofr_1", amount: "abc" },
    { offeringId: "ofr_1" },
    { amount: 5000 },
  ];
  let accepted = 0;
  for (const b of bodies) {
    const res = await request(app).post("/subscriptions").send(b);
    if (res.status === 201) accepted++;
  }
  return { attempted: bodies.length, accepted };
}

async function feedCallsWhenDown() {
  setFeedMode("down");
  resetFeedCalls();
  const requests = 10;
  const t0 = performance.now();
  for (let i = 0; i < requests; i++) {
    await request(app).post("/subscriptions").send({ offeringId: "ofr_1", amount: 10_000 });
  }
  const ms = performance.now() - t0;
  setFeedMode("up");
  return { requests, upstreamCalls: getFeedCalls(), callsPerRequest: getFeedCalls() / requests, elapsedMs: Math.round(ms) };
}

const result = {
  label,
  measuredAt: new Date().toISOString(),
  node: process.version,
  defect1_feeConsistency: {
    fixed20: await feeMismatches(FEE_CASES),
    sweep1000: await feeMismatches(sweepAmounts(1000)),
    ...feeRuleLocations(),
  },
  defect2_validation: await invalidInputsAccepted(),
  defect3_retry: await feedCallsWhenDown(),
};

mkdirSync("results", { recursive: true });
writeFileSync(`results/metrics-${label}.json`, JSON.stringify(result, null, 2) + "\n");

const d1 = result.defect1_feeConsistency;
const md = `# Metrics: ${label}

Measured locally (${result.measuredAt}, Node ${result.node}) against the in-process app.
These are **measured values from a local test**, not production or team-wide figures.

| Defect | Metric | Value |
|---|---|---|
| 1. Duplicated fee logic | Fixed cases where quote/charge/receipt disagree with spec | ${d1.fixed20.mismatches} / ${d1.fixed20.cases} |
| 1. Duplicated fee logic | Sweep (1,000 seeded amounts) mismatches | ${d1.sweep1000.mismatches} / ${d1.sweep1000.cases} |
| 1. Duplicated fee logic | Source files containing a copy of the fee rule | ${d1.filesWithFeeRule} (${d1.files.join(", ")}) |
| 2. Missing validation | Invalid requests accepted (201) | ${result.defect2_validation.accepted} / ${result.defect2_validation.attempted} |
| 3. Naive retry | Upstream calls per user request while feed is down | ${result.defect3_retry.callsPerRequest} |
| 3. Naive retry | Time for ${result.defect3_retry.requests} failing requests | ${result.defect3_retry.elapsedMs} ms |

## Example fee mismatches (first 5 of fixed cases)

${d1.fixed20.examples.length === 0 ? "_None._" : "| amount | spec | quote | charged | receipt |\n|---|---|---|---|---|\n" + d1.fixed20.examples.map((e) => `| ${e.amount} | ${e.spec} | ${e.quote} | ${e.charged} | ${e.receipt} |`).join("\n")}
`;
writeFileSync(`results/metrics-${label}.md`, md);
console.log(md);
