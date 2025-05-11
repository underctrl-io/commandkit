import { Client } from '../client';
import { GuildResponse } from '../types';

export class GuildManager {
  public constructor(public readonly client: Client) {}

  public async fetch() {
    const { data } = await this.client.api.get<GuildResponse>('/guilds');
    return data.guilds;
  }
}
