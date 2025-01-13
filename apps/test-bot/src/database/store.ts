import { setTimeout } from 'node:timers/promises';

// Simulate a random latency between 30ms to 1.5s
const randomLatency = () => setTimeout(Math.floor(Math.random() * 1500) + 30);

class DataStore {
  private store = new Map<string, any>();

  async get(key: string) {
    await randomLatency();
    return this.store.get(key);
  }

  async set(key: string, value: any) {
    await randomLatency();
    this.store.set(key, value);
  }

  async delete(key: string) {
    await randomLatency();
    this.store.delete(key);
  }

  async clear() {
    await randomLatency();
    this.store.clear();
  }
}

export const database = new DataStore();
