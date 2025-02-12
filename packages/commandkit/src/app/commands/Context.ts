import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  Message,
  Locale,
} from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { Localization } from '../i18n/Localization';

export const CommandExecutionMode = {
  Interaction: 'interaction',
  Message: 'message',
} as const;

export type CommandExecutionMode =
  (typeof CommandExecutionMode)[keyof typeof CommandExecutionMode];

export interface ContextParameters<T extends CommandExecutionMode> {
  executionMode: T;
  interaction: T extends 'interaction'
    ?
        | ChatInputCommandInteraction
        | ContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction
    : never;
  message: T extends 'message' ? Message : never;
}

export class Context<
  ExecutionMode extends CommandExecutionMode = CommandExecutionMode,
> {
  /**
   * The interaction that triggered the command.
   */
  public readonly interaction: ContextParameters<ExecutionMode>['interaction'];
  /**
   * The message that triggered the command.
   */
  public readonly message: ContextParameters<ExecutionMode>['message'];

  private _locale: Locale | null = null;

  /**
   * Creates a new command context.
   * @param commandkit The command kit instance.
   * @param config The context parameters.
   */
  public constructor(
    public readonly commandkit: CommandKit,
    private readonly config: ContextParameters<ExecutionMode>,
  ) {
    // these are assigned to readonly properties to make them accessible via object destructuring
    this.interaction = config.interaction;
    this.message = config.message;
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
  public isInteraction(): this is Context<'interaction'> {
    return this.executionMode === CommandExecutionMode.Interaction;
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
   * Returns the i18n api for this command.
   * @param locale The locale to use for the i18n api.
   */
  public locale(locale?: Locale) {
    const selectedLocale = locale ?? this.getLocale();

    return new Localization(this.commandkit, {
      locale: selectedLocale,
      target: this.getCommandIdentifier(),
    });
  }
}
