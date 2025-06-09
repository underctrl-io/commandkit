import type { CommandKit } from 'commandkit';
import { Client, Message } from 'discord.js';

export interface AiContextOptions<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  message: Message;
  params: T;
  commandkit: CommandKit;
}

export class AiContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  public params!: T;
  public message!: Message;
  public client!: Client;
  public commandkit!: CommandKit;

  public constructor(options: AiContextOptions<T>) {
    this.params = options.params;
    this.message = options.message;
    this.commandkit = options.commandkit;
    this.client = options.commandkit.client;
  }

  public setParams(params: T): void {
    this.params = params;
  }
}
