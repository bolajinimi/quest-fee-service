/** In-memory subscription store. Good enough for a single-flow demo. */

export interface Subscription {
  id: string;
  offeringId: string;
  amount: number;
  fee: number;
  total: number;
  createdAt: string;
}

const subscriptions = new Map<string, Subscription>();
let seq = 0;

export function saveSubscription(data: Omit<Subscription, "id" | "createdAt">): Subscription {
  seq++;
  const sub: Subscription = { id: `sub_${seq}`, createdAt: new Date().toISOString(), ...data };
  subscriptions.set(sub.id, sub);
  return sub;
}

export function findSubscription(id: string): Subscription | undefined {
  return subscriptions.get(id);
}

export function clearStore() {
  subscriptions.clear();
  seq = 0;
}
