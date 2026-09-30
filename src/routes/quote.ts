import { Router } from "express";

/**
 * GET /quote?amount=12345.67
 * Shows the user the fee and total BEFORE they subscribe.
 */
export const quoteRouter = Router();

quoteRouter.get("/quote", (req, res) => {
  const amount = Number(req.query.amount);

  // -------------------------------------------------------------------------
  // DEFECT-1 (intentional, for assessment): duplicated business logic, copy 1 of 3
  // Fee rule inlined here. Uses float toFixed rounding and FORGETS the NGN 50
  // minimum fee, so small quotes under-state what the user will be charged.
  // -------------------------------------------------------------------------
  const fee = Number((amount * 0.015).toFixed(2));
  const total = Number((amount + fee).toFixed(2));

  // DEFECT-2 (intentional, for assessment): no validation of `amount`
  res.json({ amount, fee, total });
});
