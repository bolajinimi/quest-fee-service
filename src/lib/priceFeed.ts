/**
 * Mock upstream "offering status" feed.
 *
 * In real life this would be an HTTP call to a pricing/offering service.
 * Here it is an in-process stub so tests and metrics are deterministic.
 */

export type FeedMode = "up" | "down";

let mode: FeedMode = "up";
let callCount = 0;

export function setFeedMode(next: FeedMode) {
  mode = next;
}

export function resetFeedCalls() {
  callCount = 0;
}

export function getFeedCalls() {
  return callCount;
}

async function callFeedOnce(offeringId: string): Promise<{ open: boolean }> {
  callCount++;
  if (mode === "down") {
    throw new Error("price feed unavailable");
  }
  return { open: offeringId !== "closed-offering" };
}

// ---------------------------------------------------------------------------
// DEFECT-3 (intentional, for assessment): naive retry
// Retries 5 times back-to-back with no delay/backoff and no distinction between
// retryable and non-retryable errors. When the feed is down, every user request
// becomes 6 upstream calls in a few milliseconds, amplifying the outage.
// ---------------------------------------------------------------------------
export async function getOfferingStatus(offeringId: string): Promise<{ open: boolean }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      return await callFeedOnce(offeringId);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
