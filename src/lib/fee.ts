/**
 * The fee rule: 1.5% of the amount, rounded half-up to the kobo, minimum
 * NGN 50.00. This is the only place the rule is implemented — quote, charge
 * and receipt all call `calculateFee`.
 *
 * Money is handled in integer kobo throughout. Naira floats (e.g.
 * `Math.round(amount * 0.015 * 100) / 100`) accumulate rounding error at
 * different amounts depending on how the multiplication lands; integer
 * kobo math does not.
 */

const FEE_PER_MILLE = 15; // 1.5%, as an integer numerator over 1000
const MIN_FEE_KOBO = 5000; // NGN 50.00

function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

function fromKobo(kobo: number): number {
  return kobo / 100;
}

export interface FeeResult {
  fee: number;
  total: number;
}

export function calculateFee(amount: number): FeeResult {
  const amountKobo = toKobo(amount);
  const rawFeeKobo = Math.floor((amountKobo * FEE_PER_MILLE + 500) / 1000);
  const feeKobo = Math.max(MIN_FEE_KOBO, rawFeeKobo);

  return { fee: fromKobo(feeKobo), total: fromKobo(amountKobo + feeKobo) };
}
