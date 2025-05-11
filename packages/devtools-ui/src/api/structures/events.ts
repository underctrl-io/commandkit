import { Client } from '../client';

export interface ParsedEvent {
  event: string;
  path: string;
  listeners: string[];
  namespace: string | null;
}

export interface AppEventsHandlerLoadedData {
  name: string;
  namespace: string | null;
  onceListeners: number;
  regularListeners: number;
  metadata: ParsedEvent;
}

export interface EventResponse {
  events: AppEventsHandlerLoadedData[];
}

export class EventManager {
  public constructor(public readonly client: Client) {}

  public async fetch() {
    const { data } = await this.client.api.get<EventResponse>('/events');
    return data.events;
  }
}
