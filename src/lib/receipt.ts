/**
 * Receipt formatting helpers.
 */

// ---------------------------------------------------------------------------
// DEFECT-1 (intentional, for assessment): duplicated business logic, copy 3 of 3
// Fee rule re-implemented here for the receipt. Rounds UP (Math.ceil) instead of
// half-up, so the receipt can show a different fee from what was charged.
// ---------------------------------------------------------------------------
export function receiptFee(amount: number): number {
  const fee = Math.ceil(amount * 0.015 * 100) / 100;
  return fee < 50 ? 50 : fee;
}

export function formatNaira(value: number): string {
  return `NGN ${value.toFixed(2)}`;
}
