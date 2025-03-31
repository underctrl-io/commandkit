import {
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
  getCurrentDirectory,
  MiddlewareContext,
  AutocompleteCommandContext,
  MessageContextMenuCommandContext,
  UserContextMenuCommandContext,
  LoadedCommand,
  SlashCommandContext,
} from 'commandkit';
import { join } from 'node:path';
import { loadLegacyValidations } from './loadLegacyValidations.js';
import { CommandData, loadLegacyCommands } from './loadLegacyCommands.js';
import { existsSync } from 'node:fs';

export interface LegacyHandlerPluginOptions {
  commandsPath: string;
  eventsPath: string;
  validationsPath: string;
  skipBuiltInValidations: boolean;
  devUserIds: string[];
  devGuildIds: string[];
  devRoleIds: string[];
}

export class LegacyHandlerPlugin extends RuntimePlugin<LegacyHandlerPluginOptions> {
  public readonly name = 'LegacyHandlerPlugin';

  private getPath(path: string): string {
    const basePath = getCurrentDirectory();
    return join(basePath, path);
  }

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LegacyHandlerPlugin activated');
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    Logger.info('LegacyHandlerPlugin deactivated');
  }

  public async onEventsRouterInit(ctx: CommandKitPluginRuntime): Promise<void> {
    const path = this.getPath(this.options.eventsPath);

    if (!existsSync(path)) return;

    ctx.commandkit.eventsRouter.addEntrypoints([path]);
  }

  public async onBeforeCommandsLoad(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {
    const middlewareIds = await this.loadValidations(ctx);
    await this.loadCommands(ctx, middlewareIds);
  }

  private async loadCommands(
    ctx: CommandKitPluginRuntime,
    middlewareIds: string[],
  ) {
    const commandsPath = this.getPath(this.options.commandsPath);
    if (!existsSync(commandsPath)) return;
    const commands = await loadLegacyCommands(commandsPath);

    const commandHandler = ctx.commandkit.commandHandler;

    for (const command of commands) {
      const data: LoadedCommand = {
        command: {
          category: command.category,
          id: crypto.randomUUID(),
          name: command.data.name,
          middlewares: middlewareIds,
          parentPath: commandsPath,
          path: command.path,
          relativePath: `legacy/${command.path}`,
        },
        data: {
          autocomplete: (ctx: AutocompleteCommandContext) =>
            command.autocomplete?.({
              client: ctx.client as any,
              interaction: ctx.interaction as any,
              handler: ctx.commandkit,
            }),
          messageContextMenu: command.messageContextMenu
            ? (ctx: MessageContextMenuCommandContext) =>
                command.messageContextMenu?.({
                  client: ctx.client as any,
                  interaction: ctx.interaction as any,
                  handler: ctx.commandkit,
                })
            : undefined,
          userContextMenu: command.messageContextMenu
            ? (ctx: UserContextMenuCommandContext) =>
                command.userContextMenu?.({
                  client: ctx.client as any,
                  interaction: ctx.interaction as any,
                  handler: ctx.commandkit,
                })
            : undefined,
          chatInput: (ctx: SlashCommandContext) =>
            command.chatInput?.({
              client: ctx.client as any,
              interaction: ctx.interaction as any,
              handler: ctx.commandkit,
            }),
          command: command.data,
        } as any,
        guilds: command.options?.guildOnly ? this.options.devGuildIds : [],
      };

      (data.data as any).__command = command.options;

      await commandHandler.registerExternalLoadedCommands([data]);
    }
  }

  private async loadValidations(ctx: CommandKitPluginRuntime) {
    const validationsPath = this.getPath(this.options.validationsPath);
    if (!existsSync(validationsPath)) return [];

    const validations = await loadLegacyValidations(
      validationsPath,
      this.options,
      this.options.skipBuiltInValidations,
    );

    const commandHandler = ctx.commandkit.commandHandler;

    const middlewareIds: string[] = [];

    for (const validation of validations.validations) {
      const id = crypto.randomUUID();
      middlewareIds.push(id);
      await commandHandler.registerExternalLoadedMiddleware([
        {
          data: {
            async afterExecute(ctx: MiddlewareContext) {
              void ctx;
              return undefined;
            },
            async beforeExecute(ctx: MiddlewareContext) {
              const result = await validation.validate({
                client: ctx.client as any,
                interaction: ctx.interaction as any,
                commandObj: {
                  category: ctx.command.command.category,
                  filePath: ctx.command.command.path,
                  data: ctx.command.data.command as CommandData,
                  options: (ctx.command.data as any).__command || {},
                },
                handler: ctx.commandkit,
              });

              if (result === true) return ctx.cancel();
            },
          } as any,
          middleware: {
            global: true,
            id,
            name: validation.name,
            parentPath: validationsPath,
            path: validation.path,
            relativePath: validation.path,
          },
        },
      ]);
    }

    return middlewareIds;
  }
}

export function legacy(options?: Partial<LegacyHandlerPluginOptions>) {
  return new LegacyHandlerPlugin({
    commandsPath: './commands',
    eventsPath: './events',
    validationsPath: './validations',
    skipBuiltInValidations: false,
    devUserIds: [],
    devGuildIds: [],
    devRoleIds: [],
    ...options,
  });
}

export * from './loadLegacyCommands.js';
export * from './loadLegacyValidations.js';
export * from './common.js';
