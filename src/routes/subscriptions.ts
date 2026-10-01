import { Router } from "express";
import { calculateFee } from "../lib/fee.js";
import { getOfferingStatus } from "../lib/priceFeed.js";
import { findSubscription, saveSubscription } from "../lib/store.js";
import { formatNaira } from "../lib/receipt.js";

/**
 * The one user-facing flow:
 *   POST /subscriptions        { offeringId, amount }  -> charge and store
 *   GET  /subscriptions/:id/receipt                      -> receipt for that charge
 */
export const subscriptionsRouter = Router();

subscriptionsRouter.post("/subscriptions", async (req, res) => {
  const { offeringId, amount } = req.body ?? {};

  // -------------------------------------------------------------------------
  // DEFECT-2 (intentional, for assessment): missing validation
  // amount can be negative, zero, a string, NaN, or missing; offeringId can be
  // missing. All are accepted and stored.
  // -------------------------------------------------------------------------

  let status: { open: boolean };
  try {
    status = await getOfferingStatus(String(offeringId));
  } catch {
    return res.status(503).json({ error: "offering status unavailable" });
  }
  if (!status.open) {
    return res.status(409).json({ error: "offering closed" });
  }

  const { fee, total } = calculateFee(amount);

  const sub = saveSubscription({ offeringId, amount, fee, total });
  res.status(201).json(sub);
});

subscriptionsRouter.get("/subscriptions/:id/receipt", (req, res) => {
  const sub = findSubscription(req.params.id);
  if (!sub) return res.status(404).json({ error: "not found" });

  // The receipt shows what was actually charged — it reads the stored fee
  // and total instead of recalculating them, so it can never disagree with
  // the charge even if the rule changes later.
  res.json({
    id: sub.id,
    amount: sub.amount,
    fee: sub.fee,
    total: sub.total,
    line: `Subscribed ${formatNaira(sub.amount)} + fee ${formatNaira(sub.fee)}`,
  });
});
