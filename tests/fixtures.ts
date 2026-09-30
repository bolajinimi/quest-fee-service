/**
 * Shared test fixtures.
 *
 * The business rule (the "spec") lives here, written independently of the app
 * code, so tests never grade the implementation against itself:
 *
 *   fee   = 1.5% of amount, rounded half-up to the nearest kobo, minimum NGN 50.00
 *   total = amount + fee
 */

export function specFee(amount: number): number {
  const amountKobo = Math.round(amount * 100);
  const feeKobo = Math.max(5000, Math.floor((amountKobo * 15 + 500) / 1000));
  return feeKobo / 100;
}

export function specTotal(amount: number): number {
  return (Math.round(amount * 100) + Math.round(specFee(amount) * 100)) / 100;
}

/** 20 fixed amounts chosen to cover: below/at/above the minimum, rounding edges, large values. */
export const FEE_CASES: number[] = [
  100, 1000, 2500, 3333.33, 3333.34,
  3336.66, 3340, 5000, 10_000, 12_345.67,
  12_345.99, 20_000.1, 33_333.33, 50_000, 99_999.99,
  100_000, 123_456.78, 250_000.5, 999_999.97, 1_000_000,
];

/** Deterministic pseudo-random amounts (NGN 1.00 – 2,000,000.00) for a wider sweep. */
export function sweepAmounts(n = 1000, seed = 42): number[] {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
  return Array.from({ length: n }, () => Math.round((1 + rand() * 1_999_999) * 100) / 100);
}
