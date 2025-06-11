import type { CommandKit } from 'commandkit';
import { Client, Message } from 'discord.js';

/**
 * Options for the AI context.
 */
export interface AiContextOptions<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The message that triggered the AI command.
   */
  message: Message;
  /**
   * The parameters passed to the AI command.
   */
  params: T;
  /**
   * The CommandKit instance associated with the AI command.
   */
  commandkit: CommandKit;
}

/**
 * Represents the context in which an AI command is executed.
 * This includes the parameters passed to the command, the message that triggered it,
 * and the CommandKit instance associated with the command.
 */
export class AiContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The parameters passed to the AI command.
   */
  public params!: T;
  /**
   * The message that triggered the AI command.
   */
  public message!: Message;
  /**
   * The client instance associated with the AI command.
   */
  public client!: Client;
  /**
   * The CommandKit instance associated with the AI command.
   */
  public commandkit!: CommandKit;
  /**
   * A key-value store to hold additional data.
   */
  public store = new Map<string, any>();

  /**
   * Creates a new instance of AiContext.
   * @param options - The options for the AI context, including the message, parameters, and CommandKit instance.
   */
  public constructor(options: AiContextOptions<T>) {
    this.params = options.params;
    this.message = options.message;
    this.commandkit = options.commandkit;
    this.client = options.commandkit.client;
  }

  /**
   * Sets the parameters for the AI context.
   * @param params - The parameters to set.
   */
  public setParams(params: T): void {
    this.params = params;
  }
}
