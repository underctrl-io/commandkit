import { LegacyCommandsCLIPlugin } from './cli.js';
import { LegacyHandlerPlugin, LegacyHandlerPluginOptions } from './plugin.js';

export function legacy(
  options?: Partial<LegacyHandlerPluginOptions>,
): [LegacyHandlerPlugin, LegacyCommandsCLIPlugin] {
  const opts = {
    commandsPath: './commands',
    eventsPath: './events',
    validationsPath: './validations',
    skipBuiltInValidations: false,
    devUserIds: [],
    devGuildIds: [],
    devRoleIds: [],
    ...options,
  };
  const plugin = new LegacyHandlerPlugin(opts);
  const cli = new LegacyCommandsCLIPlugin(opts);

  return [plugin, cli];
}

export * from './plugin.js';
export * from './loadLegacyCommands.js';
export * from './loadLegacyValidations.js';
export * from './common.js';
export * from './cli.js';
