import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { setFeedMode } from "../src/lib/priceFeed.js";
import { clearStore } from "../src/lib/store.js";

/** Behaviour of the flow that must NOT change while fixing the fee logic. */
describe("subscription flow (regression guard)", () => {
  const app = createApp();

  beforeEach(() => {
    clearStore();
    setFeedMode("up");
  });

  it("creates a subscription and returns the documented shape", async () => {
    const res = await request(app).post("/subscriptions").send({ offeringId: "ofr_1", amount: 10_000 });
    expect(res.status).toBe(201);
    expect(Object.keys(res.body).sort()).toEqual(
      ["amount", "createdAt", "fee", "id", "offeringId", "total"].sort(),
    );
  });

  it("returns 409 when the offering is closed", async () => {
    const res = await request(app).post("/subscriptions").send({ offeringId: "closed-offering", amount: 10_000 });
    expect(res.status).toBe(409);
  });

  it("returns 503 when the offering feed is down", async () => {
    setFeedMode("down");
    const res = await request(app).post("/subscriptions").send({ offeringId: "ofr_1", amount: 10_000 });
    expect(res.status).toBe(503);
  });

  it("returns 404 for an unknown receipt", async () => {
    const res = await request(app).get("/subscriptions/nope/receipt");
    expect(res.status).toBe(404);
  });

  it("quote response keeps its shape", async () => {
    const res = await request(app).get("/quote").query({ amount: 10_000 });
    expect(Object.keys(res.body).sort()).toEqual(["amount", "fee", "total"]);
  });
});
