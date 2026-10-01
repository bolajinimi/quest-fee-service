import { describe, expect, it } from "vitest";
import { calculateFee } from "../src/lib/fee.js";

describe("calculateFee", () => {
  it("applies the NGN 50 minimum when 1.5% would be below it", () => {
    expect(calculateFee(1000)).toEqual({ fee: 50, total: 1050 });
  });

  it("sits exactly at the minimum boundary", () => {
    // 1.5% of 3333.34 is 50.0001 -> rounds to exactly the 50.00 minimum
    expect(calculateFee(3333.34)).toEqual({ fee: 50, total: 3383.34 });
  });

  it("rounds half-up to the kobo", () => {
    // 1.5% of 3336.66 is 50.0499 -> half-up rounds the .049 up to 50.05
    expect(calculateFee(3336.66)).toEqual({ fee: 50.05, total: 3386.71 });
  });

  it("computes 1.5% correctly for a large amount", () => {
    expect(calculateFee(1_000_000)).toEqual({ fee: 15_000, total: 1_015_000 });
  });
});
