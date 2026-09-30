# quest-fee-service

A tiny subscription service with **one user-facing flow** (quote → subscribe → receipt), built for a quality and maintainability exercise. Three quality problems were introduced **on purpose** and are labelled `DEFECT-1`, `DEFECT-2` and `DEFECT-3` in the code.

- Why this problem: [`intent.md`](intent.md)
- Directive and evidence: [`directive.md`](directive.md) (v1: [`directive.v1.md`](directive.v1.md))
- Decision record: [`decision-record.md`](decision-record.md)
- Handoff and review checklist: [`HANDOFF.md`](HANDOFF.md)

```bash
npm ci
npm run check           # typecheck + tests
npm run metrics -- me   # before/after quality metrics -> results/
npm run dev             # http://localhost:3000
```

Requires Node 20+.
