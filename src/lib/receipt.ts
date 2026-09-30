/**
 * Receipt formatting helpers.
 */

export function formatNaira(value: number): string {
  return `NGN ${value.toFixed(2)}`;
}
