import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { setFeedMode } from "../src/lib/priceFeed.js";
import { clearStore } from "../src/lib/store.js";
import { FEE_CASES, specFee, specTotal } from "./fixtures.js";

/**
 * The quote the user sees, the amount actually charged, and the receipt must
 * all agree with the business rule. On the baseline (DEFECT-1) several fail.
 */
describe("fee consistency across quote, charge and receipt", () => {
  const app = createApp();

  beforeEach(() => {
    clearStore();
    setFeedMode("up");
  });

  it.each(FEE_CASES)("amount %d: quote = charge = receipt = spec", async (amount) => {
    const quote = await request(app).get("/quote").query({ amount });
    const charge = await request(app).post("/subscriptions").send({ offeringId: "ofr_1", amount });
    const receipt = await request(app).get(`/subscriptions/${charge.body.id}/receipt`);

    const expected = { fee: specFee(amount), total: specTotal(amount) };

    expect({ fee: quote.body.fee, total: quote.body.total }, "quote").toEqual(expected);
    expect({ fee: charge.body.fee, total: charge.body.total }, "charge").toEqual(expected);
    expect({ fee: receipt.body.fee, total: receipt.body.total }, "receipt").toEqual(expected);
  });
});
