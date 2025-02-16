import { setTimeout } from 'node:timers/promises';

// Simulate a random latency between 30ms to 1.5s
const randomLatency = () => setTimeout(Math.floor(Math.random() * 1500) + 100);

class DataStore {
  private store = new Map<string, any>();

  async get(key: string) {
    await randomLatency();
    const value = this.store.get(key);

    return value;
  }

  async set(key: string, value: any) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }
}

export const database = new DataStore();
