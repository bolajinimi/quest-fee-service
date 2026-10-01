import { Router } from "express";
import { calculateFee } from "../lib/fee.js";

/**
 * GET /quote?amount=12345.67
 * Shows the user the fee and total BEFORE they subscribe.
 */
export const quoteRouter = Router();

quoteRouter.get("/quote", (req, res) => {
  const amount = Number(req.query.amount);

  // DEFECT-2 (intentional, for assessment, out of scope): no validation of `amount`
  const { fee, total } = calculateFee(amount);

  res.json({ amount, fee, total });
});
