import { Channel } from 'diagnostics_channel';
import {
  Message,
  ApplicationCommandOptionType,
  GuildMember,
  Attachment,
  User,
  Role,
  CommandInteractionOption,
} from 'discord.js';
import {
  CommandKitErrorCodes,
  createCommandKitError,
} from '../../utils/error-codes';

export interface ParsedMessageCommand {
  command: string;
  options: { name: string; value: unknown }[];
  subcommand?: string;
  subcommandGroup?: string;
}

export type MessageCommandOptionsSchema = Record<
  string,
  ApplicationCommandOptionType
>;

export class MessageCommandParser {
  #parsed: ParsedMessageCommand | null = null;
  #options: MessageCommandOptions | null = null;
  #args: string[] = [];

  public constructor(
    public message: Message,
    private prefix: string[],
    private schema: (command: string) => MessageCommandOptionsSchema,
  ) {}

  public getArgs() {
    void this.parse();
    return this.#args;
  }

  public get options() {
    if (!this.#options) {
      this.#options = new MessageCommandOptions(this);
    }

    return this.#options;
  }

  public getOption<T>(name: string): T | undefined {
    return this.parse().options.find((o) => o.name === name)?.value as T;
  }

  public getCommand(): string {
    return this.parse().command;
  }

  public getSubcommand(): string | undefined {
    return this.parse().subcommand;
  }

  public getSubcommandGroup(): string | undefined {
    return this.parse().subcommandGroup;
  }

  public getPrefix() {
    for (const p of this.prefix) {
      if (this.message.content.startsWith(p)) {
        return p;
      }
    }
  }

  public getFullCommand() {
    return [this.getCommand(), this.getSubcommandGroup(), this.getSubcommand()]
      .filter((v) => v)
      .join(' ');
  }

  public parse(): ParsedMessageCommand {
    if (this.#parsed) {
      return this.#parsed;
    }

    const content = this.message.content;

    const prefix = this.getPrefix();

    if (!prefix) {
      throw createCommandKitError(CommandKitErrorCodes.InvalidCommandPrefix);
    }

    const parts = content.slice(prefix.length).trim().split(' ');
    const command = parts.shift();

    this.#args = parts;

    let subcommandGroup: string | undefined;
    let subcommand: string | undefined;

    if (command?.includes(':')) {
      const [, group, cmd] = command.split(':');

      if (!cmd && group) {
        subcommand = group;
      } else if (cmd && group) {
        subcommandGroup = group;
        subcommand = cmd;
      }
    }

    const schema = this.schema(
      [command, subcommandGroup, subcommand].filter(Boolean).join(' ').trim(),
    );

    const options = parts
      .map((part) => {
        try {
          const [name, value] = part.split(':');

          if (!(name in schema)) return null;

          switch (schema[name]) {
            case ApplicationCommandOptionType.Boolean:
              return { name, value: value === 'true' };
            case ApplicationCommandOptionType.Integer:
              return { name, value: parseInt(value, 10) };
            case ApplicationCommandOptionType.Number:
              return { name, value: parseFloat(value) };
            case ApplicationCommandOptionType.String:
              return { name, value };
            case ApplicationCommandOptionType.User:
              return {
                name,
                value: this.message.mentions.users.find((u) => {
                  return u.id === value.replace(/[<@!>]/g, '');
                }),
              };
            case ApplicationCommandOptionType.Channel:
              return {
                name,
                value: this.message.mentions.channels.find((c) => {
                  return c.id === value.replace(/[<#>]/g, '');
                }),
              };
            case ApplicationCommandOptionType.Role:
              return {
                name,
                value: this.message.mentions.roles.find((r) => {
                  return r.id === value.replace(/[<@&>]/g, '');
                }),
              };
            case ApplicationCommandOptionType.Attachment:
              return {
                name,
                value: this.message.attachments.find((a) => {
                  return a.name === value;
                }),
              };
            default:
              return null;
          }
        } catch {
          // Invalid option
          return null;
        }
      })
      .filter((v) => v !== null);

    this.#parsed = {
      command: command!,
      options,
      subcommand,
      subcommandGroup,
    };

    return this.#parsed;
  }
}

export class MessageCommandOptions {
  public constructor(private parser: MessageCommandParser) {}

  private assertOption<T>(name: string, required = false) {
    const option = this.parser.getOption<T>(name);

    if (required && option === undefined) {
      throw new Error(`Option "${name}" is required.`);
    }

    return option ?? null;
  }

  getMember(name: string): GuildMember | null;
  getMember(name: string, required: true): GuildMember;
  getMember(name: string, required = false) {
    const user = this.assertOption<User>(name, required);
    const member = this.parser.message.guild?.members.cache.get(user?.id!);

    if (required && !member) {
      throw new Error(`Member "${name}" is required.`);
    }

    return member ?? null;
  }

  getAttachment(name: string): Attachment | null;
  getAttachment(name: string, required: true): Attachment;
  getAttachment(name: string, required = false) {
    return this.assertOption<Attachment>(name, required);
  }

  getBoolean(name: string): boolean | null;
  getBoolean(name: string, required: true): boolean;
  getBoolean(name: string, required = false) {
    return this.assertOption<boolean>(name, required);
  }

  getNumber(name: string): number | null;
  getNumber(name: string, required: true): number;
  getNumber(name: string, required = false) {
    return this.assertOption<number>(name, required);
  }

  getString(name: string): string | null;
  getString(name: string, required: true): string;
  getString(name: string, required = false) {
    return this.assertOption<string>(name, required);
  }

  getInteger(name: string): number | null;
  getInteger(name: string, required: true): number;
  getInteger(name: string, required = false) {
    return this.assertOption<number>(name, required);
  }

  getUser(name: string): User | null;
  getUser(name: string, required: true): User;
  getUser(name: string, required = false) {
    return this.assertOption<User>(name, required);
  }

  getChannel(name: string): Channel | null;
  getChannel(name: string, required: true): Channel;
  getChannel(name: string, required = false) {
    return this.assertOption<Channel>(name, required);
  }

  getRole(name: string): Role | null;
  getRole(name: string, required: true): Role;
  getRole(name: string, required = false) {
    return this.assertOption<Role>(name, required);
  }

  getMentionable(
    name: string,
  ): NonNullable<CommandInteractionOption['member' | 'role' | 'user']> | null;
  getMentionable(
    name: string,
    required: true,
  ): NonNullable<CommandInteractionOption['member' | 'role' | 'user']>;
  getMentionable(
    name: string,
    required = false,
  ): NonNullable<CommandInteractionOption['member' | 'role' | 'user']> | null {
    const target = this.assertOption(name, required);

    if (
      target instanceof GuildMember ||
      target instanceof User ||
      target instanceof Role
    ) {
      return target;
    }

    if (required) {
      throw new Error(`Mentionable "${name}" is required.`);
    }

    return null;
  }

  getSubcommand(): string | null;
  getSubcommand(required: true): string;
  getSubcommand(required = false) {
    const sub = this.parser.getSubcommand();

    if (required && sub === undefined) {
      throw new Error('Subcommand is required.');
    }

    return sub ?? null;
  }

  getSubcommandGroup(): string | null;
  getSubcommandGroup(required: true): string;
  getSubcommandGroup(required = false) {
    const sub = this.parser.getSubcommandGroup();

    if (required && sub === undefined) {
      throw new Error('Subcommand group is required.');
    }

    return sub ?? null;
  }
}
