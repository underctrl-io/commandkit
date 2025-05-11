import { Client } from '../client';

export interface PluginResponse {
  plugins: {
    name: string;
    id: string;
    loadedAt: number;
  }[];
}

export class PluginManager {
  public constructor(public readonly client: Client) {}

  public async fetch() {
    const { data } = await this.client.api.get<PluginResponse>('/plugins');
    return data.plugins;
  }
}
