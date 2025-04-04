import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  Message,
  Locale,
  Interaction,
  UserContextMenuCommandInteraction,
  Client,
  Awaitable,
} from 'discord.js';
import { CommandKit } from '../../CommandKit';
import {
  MessageCommandOptions,
  MessageCommandParser,
} from './MessageCommandParser';
import {
  afterCommand,
  cancelAfterCommand,
  CommandKitEnvironment,
} from '../../context/environment';
import { GenericFunction, getContext } from '../../context/async-context';
import { exitMiddleware, redirect } from '../middleware/signals';
import { isCachedFunction } from '../../cache';
import {
  LoadedCommand,
  ResolvableCommand,
  RunCommand,
} from '../handlers/AppCommandHandler';

export const CommandExecutionMode = {
  SlashCommand: 'chatInput',
  MessageContextMenu: 'messageContextMenu',
  UserContextMenu: 'userContextMenu',
  Autocomplete: 'autocomplete',
  Message: 'message',
} as const;

export type CommandExecutionMode =
  (typeof CommandExecutionMode)[keyof typeof CommandExecutionMode];

export interface ContextParameters<
  T extends CommandExecutionMode,
  Args = Record<string, any>,
> {
  command: LoadedCommand;
  environment?: CommandKitEnvironment;
  executionMode: T;
  interaction: T extends 'chatInput'
    ? ChatInputCommandInteraction
    : T extends 'messageContextMenu'
      ? MessageContextMenuCommandInteraction
      : T extends 'userContextMenu'
        ? UserContextMenuCommandInteraction
        : T extends 'autocomplete'
          ? AutocompleteInteraction
          : never;
  message: T extends 'message' ? Message : never;
  forwarded?: boolean;
  messageCommandParser?: T extends 'message' ? MessageCommandParser : never;
  store?: Map<string, any>;
  customArgs?: Args;
}

export type MessageCommandContext = Context<'message'>;
export type InteractionCommandContext = Context<
  'autocomplete' | 'chatInput' | 'messageContextMenu' | 'userContextMenu'
>;
export type MessageCommandMiddlewareContext = MiddlewareContext<'message'>;
export type InteractionCommandMiddlewareContext = MiddlewareContext<
  'autocomplete' | 'chatInput' | 'messageContextMenu' | 'userContextMenu'
>;
export type SlashCommandContext = Context<'chatInput'>;
export type SlashCommandMiddlewareContext = MiddlewareContext<'chatInput'>;
export type AutocompleteCommandContext = Context<'autocomplete'>;
export type AutocompleteCommandMiddlewareContext =
  MiddlewareContext<'autocomplete'>;
export type MessageContextMenuCommandContext = Context<'messageContextMenu'>;
export type MessageContextMenuCommandMiddlewareContext =
  MiddlewareContext<'messageContextMenu'>;
export type UserContextMenuCommandContext = Context<'userContextMenu'>;
export type UserContextMenuCommandMiddlewareContext =
  MiddlewareContext<'userContextMenu'>;

export type CommandContextOptions<T extends CommandExecutionMode> =
  T extends 'message'
    ? MessageCommandOptions
    : T extends 'chatInput'
      ? ChatInputCommandInteraction['options']
      : T extends 'autocomplete'
        ? AutocompleteInteraction['options']
        : T extends 'messageContextMenu'
          ? MessageContextMenuCommandInteraction['options']
          : T extends 'userContextMenu'
            ? UserContextMenuCommandInteraction['options']
            : never;

export type AnyCommandExecute<ContextType extends Context = Context> = (
  ctx: ContextType,
) => Awaitable<unknown>;

export type SlashCommand = AnyCommandExecute<SlashCommandContext>;
export type AutocompleteCommand = AnyCommandExecute<AutocompleteCommandContext>;
export type MessageContextMenuCommand =
  AnyCommandExecute<MessageContextMenuCommandContext>;
export type UserContextMenuCommand =
  AnyCommandExecute<UserContextMenuCommandContext>;
export type MessageCommand = AnyCommandExecute<MessageCommandContext>;

export interface MiddlewareContextArgs {
  setCommandRunner?: GenericFunction<[RunCommand]>;
}

export class Context<
  ExecutionMode extends CommandExecutionMode = CommandExecutionMode,
  Args extends Record<string, any> = Record<string, any>,
> {
  /**
   * The interaction that triggered the command.
   */
  public readonly interaction: ContextParameters<ExecutionMode>['interaction'];

  /**
   * The message that triggered the command.
   */
  public readonly message: ContextParameters<ExecutionMode>['message'];

  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The command that this context belongs to.
   */
  public readonly command: LoadedCommand;

  #store: Map<string, any>;

  private _locale: Locale | null = null;

  /**
   * Creates a new command context.
   * @param commandkit The command kit instance.
   * @param config The context parameters.
   */
  public constructor(
    public readonly commandkit: CommandKit,
    protected readonly config: ContextParameters<ExecutionMode, Args>,
  ) {
    // these are assigned to readonly properties to make them accessible via object destructuring
    this.interaction = config.interaction;
    this.message = config.message;
    this.client = commandkit.client;
    this.#store = config.store ?? new Map();
    this.command = config.command;

    if (this.config.environment) {
      this.config.environment.setContext(this);
    }
  }

  /**
   * The shared key-value store for this context. This can be used to store data that needs to be shared between middlewares or commands.
   * This store is shared across all contexts in the same command execution, including the cloned contexts and middleware contexts.
   */
  public get store() {
    return this.#store;
  }

  public get commandName(): string {
    if (this.isInteraction()) {
      return this.interaction.commandName;
    } else {
      return this.config.messageCommandParser!.getCommand();
    }
  }

  public get options(): CommandContextOptions<ExecutionMode> {
    if (this.isMessage()) {
      const parser = this.config.messageCommandParser!;
      // @ts-expect-error
      return parser.options;
    } else {
      const interaction = (<InteractionCommandContext>this).interaction;
      // @ts-expect-error
      return interaction.options;
    }
  }

  /**
   * Whether this context was forwarded from another context. This happens when a command forwards its context to another command.
   */
  public get forwarded(): boolean {
    return this.config.forwarded ?? false;
  }

  /**
   * Forwards the context to another command. The target handler will be the same as current handler.
   * @param command The command to forward to.
   */
  public async forwardCommand<C extends ResolvableCommand>(
    command: C,
  ): Promise<never> {
    const target = await this.commandkit.commandHandler.prepareCommandRun(
      (this.isInteraction() ? this.interaction : this.message) as Interaction,
      command,
    );

    if (!target) {
      throw new Error(`Command ${command} not found`);
    }

    const env = this.config.environment ?? getContext();

    if (!env) {
      throw new Error('No commandkit environment found.');
    }

    const handlers = {
      chatInput: target.command.data.chatInput,
      autocomplete: target.command.data.autocomplete,
      message: target.command.data.message,
      messageContextMenu: target.command.data.messageContextMenu,
      userContextMenu: target.command.data.userContextMenu,
    };

    const handlerKind = env.variables.get(
      'execHandlerKind',
    ) as keyof typeof handlers;

    if (!handlerKind) {
      throw new Error('No execution handler kind found.');
    }

    const handler = handlers[handlerKind];

    if (!handler) {
      throw new Error(`No handler found for ${handlerKind}`);
    }

    env.variables.set('forwardedBy', this.commandName);
    env.variables.set('forwardedTo', command);

    await handler(this.clone({ forwarded: true }));

    redirect();
  }

  /**
   * The execution mode of the command.
   */
  public get executionMode(): ExecutionMode {
    return this.config.executionMode;
  }

  /**
   * Whether the command was triggered by an interaction.
   */
  public isInteraction(): this is InteractionCommandContext {
    return (
      this.executionMode === CommandExecutionMode.SlashCommand ||
      this.executionMode === CommandExecutionMode.Autocomplete ||
      this.executionMode === CommandExecutionMode.MessageContextMenu ||
      this.executionMode === CommandExecutionMode.UserContextMenu
    );
  }

  /**
   * Whether the command was triggered by a slash command interaction.
   */
  public isSlashCommand(): this is SlashCommandContext {
    return this.executionMode === CommandExecutionMode.SlashCommand;
  }

  /**
   * Whether the command was triggered by an autocomplete interaction.
   */
  public isAutocomplete(): this is AutocompleteCommandContext {
    return this.executionMode === CommandExecutionMode.Autocomplete;
  }

  /**
   * Whether the command was triggered by a message context menu interaction.
   */
  public isMessageContextMenu(): this is MessageContextMenuCommandContext {
    return this.executionMode === CommandExecutionMode.MessageContextMenu;
  }

  /**
   * Whether the command was triggered by a user context menu interaction.
   */
  public isUserContextMenu(): this is UserContextMenuCommandContext {
    return this.executionMode === CommandExecutionMode.UserContextMenu;
  }

  /**
   * Whether the command was triggered by a message.
   */
  public isMessage(): this is Context<'message'> {
    return this.executionMode === CommandExecutionMode.Message;
  }

  /**
   * Returns the command identifier.
   */
  public getCommandIdentifier(): string {
    if (this.isInteraction()) {
      return this.interaction.commandName;
    } else {
      return this.message.content.split(' ')[0].slice(1);
    }
  }

  /**
   * Returns the locale of the guild where this command was triggered.
   */
  public getGuildLocale(): Locale | null {
    if (this.isInteraction()) {
      return this.interaction.guildLocale;
    } else {
      return this.message.guild?.preferredLocale ?? null;
    }
  }

  /**
   * Returns the locale of the user who triggered this command.
   */
  public getUserLocale(): Locale | null {
    if (this.isInteraction()) {
      return this.interaction.locale;
    } else {
      return null;
    }
  }

  /**
   * Returns the locale for this command.
   * @param preferUser Whether to prefer the user's locale over the guild's locale.
   * @returns The locale for this command. If no locale is found, the default locale is returned.
   */
  public getLocale(preferUser = false): Locale {
    if (this._locale) return this._locale;

    const locale = preferUser ? this.getUserLocale() : this.getGuildLocale();

    if (!locale) {
      return this.commandkit.config.defaultLocale;
    }

    return locale;
  }

  /**
   * Sets the locale for this command.
   * @param locale The locale to set.
   */
  public setLocale(locale: Locale | null): void {
    this._locale = locale;
  }

  /**
   * Creates a clone of this context
   */
  public clone(
    config?: Partial<ContextParameters<ExecutionMode>>,
  ): Context<ExecutionMode> {
    if (!config) return new Context(this.commandkit, this.config);

    const ctx = new Context(this.commandkit, {
      ...this.config,
      ...config,
      store: this.#store,
    });

    return ctx;
  }

  public isMiddleware(): this is MiddlewareContext<ExecutionMode> {
    return this instanceof MiddlewareContext;
  }

  public args(): string[] {
    if (this.isMessage()) {
      return this.config.messageCommandParser!.getArgs();
    }

    return [];
  }

  /**
   * Stops upcoming middleware or current command execution.
   * If this is called inside pre-stage middleware, the next run will be the actual command, skipping all other pre-stage middlewares.
   * If this is called inside a command itself, it will skip all post-stage middlewares.
   * If this is called inside post-stage middleware, it will skip all other post-stage middlewares.
   */
  public exit() {
    exitMiddleware();
  }

  /**
   * Defers the given function to be executed after this command's execution.
   * @param fn The function to defer.
   * @returns A unique identifier for the deferred function.
   */
  public defer(fn: GenericFunction<[CommandKitEnvironment]>): string {
    return afterCommand(fn);
  }

  /**
   * Cancels the deferred function with the given identifier.
   * @param id The identifier of the deferred function.
   */
  public cancelDeferred(id: string): void {
    cancelAfterCommand(id);
  }

  /**
   * Validates if the given function is a cached function.
   * @param fn The function to validate.
   */
  public isCached(fn: GenericFunction): boolean {
    return isCachedFunction(fn);
  }
}

export class MiddlewareContext<
  T extends CommandExecutionMode = CommandExecutionMode,
> extends Context<T, MiddlewareContextArgs> {
  #cancel = false;

  /**
   * Whether the command execution was cancelled.
   */
  public get cancelled(): boolean {
    return this.#cancel;
  }

  /**
   * Cancels the command execution.
   */
  public cancel(): void {
    this.#cancel = true;
  }

  /**
   * Sets command runner function to wrap the command execution.
   * @param fn The function to set.
   * @example ctx.setCommandRunner(async (execute) => {
   *  // do something before command execution
   *  await execute();
   *  // do something after command execution
   * })
   */
  public setCommandRunner(fn: RunCommand): void {
    this.config.customArgs?.setCommandRunner?.(fn);
  }
}
