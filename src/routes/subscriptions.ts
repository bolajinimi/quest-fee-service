import { Router } from "express";
import { getOfferingStatus } from "../lib/priceFeed.js";
import { findSubscription, saveSubscription } from "../lib/store.js";
import { formatNaira, receiptFee } from "../lib/receipt.js";

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

  // -------------------------------------------------------------------------
  // DEFECT-1 (intentional, for assessment): duplicated business logic, copy 2 of 3
  // Fee rule inlined again. This copy TRUNCATES (Math.floor) instead of rounding
  // half-up, but does apply the NGN 50 minimum.
  // -------------------------------------------------------------------------
  let fee = Math.floor(amount * 0.015 * 100) / 100;
  if (fee < 50) fee = 50;
  const total = Math.round((amount + fee) * 100) / 100;

  const sub = saveSubscription({ offeringId, amount, fee, total });
  res.status(201).json(sub);
});

subscriptionsRouter.get("/subscriptions/:id/receipt", (req, res) => {
  const sub = findSubscription(req.params.id);
  if (!sub) return res.status(404).json({ error: "not found" });

  const fee = receiptFee(sub.amount); // recomputed, not read from the stored charge
  res.json({
    id: sub.id,
    amount: sub.amount,
    fee,
    total: Math.round((sub.amount + fee) * 100) / 100,
    line: `Subscribed ${formatNaira(sub.amount)} + fee ${formatNaira(fee)}`,
  });
});
