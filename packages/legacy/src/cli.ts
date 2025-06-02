import { CompilerPlugin, CompilerPluginRuntime, Logger } from 'commandkit';
import { LegacyHandlerPluginOptions } from './plugin.js';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';

export class LegacyCommandsCLIPlugin extends CompilerPlugin<LegacyHandlerPluginOptions> {
  public readonly name = 'LegacyCommandsCLIPlugin';

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    ctx.registerTemplate('legacy', this.handleTemplate.bind(this));
  }

  public async deactivate(ctx: CompilerPluginRuntime): Promise<void> {
    ctx.unregisterTemplate('legacy');
  }

  private panic(message: string): never {
    Logger.error(message);
    process.exit(1);
  }

  private getCommandSource(name: string, isTypeScript: boolean) {
    if (isTypeScript) {
      return `import type { CommandData, SlashCommandProps } from '@commandkit/legacy';

export const data: CommandData = {
  name: '${name}',
  description: '${name} command',
};

export async function run({ interaction }: SlashCommandProps) {
  await interaction.reply('Hello from ${name} command!');
}
`;
    }

    return `/**
 * @type {import('@commandkit/legacy').CommandData}
 */
export const command = {
  name: '${name}',
  description: '${name} command',
};

/**
 * @type {import('@commandkit/legacy').SlashCommandProps}
 */
export async function run({ interaction }: SlashCommandProps) {
  await interaction.reply('Hello from ${name} command!');
}
`;
  }

  private async handleTemplate(args: string[]): Promise<void> {
    const message = `Invalid arguments for legacy template. Expected: <command|event> <name>`;

    if (args.length < 2) {
      this.panic(message);
    }

    const isTypeScript = existsSync(join(process.cwd(), 'tsconfig.json'));
    const extension = isTypeScript ? 'ts' : 'js';

    const [type, name] = args;

    switch (type) {
      case 'command': {
        const commandPath = join(
          process.cwd(),
          'src',
          this.options.commandsPath,
          `${name}.${extension}`,
        );

        if (existsSync(commandPath)) {
          this.panic(`Command ${name} already exists.`);
        }

        await writeFile(commandPath, this.getCommandSource(name, isTypeScript));

        return Logger.info(
          `Command ${name} created successfully at ${commandPath}.`,
        );
      }
      case 'event': {
        let fileName = `${name}.${extension}`;
        const eventPathDir = join(
          process.cwd(),
          'src',
          this.options.eventsPath,
          name,
        );

        if (!existsSync(eventPathDir)) {
          mkdirSync(eventPathDir, { recursive: true });
        }

        let iter = 1;
        while (true) {
          if (!existsSync(`${eventPathDir}/${fileName}`)) break;
          fileName = `${name}-${iter}.${extension}`;
          iter++;
        }

        const eventPath = join(eventPathDir, fileName);

        await writeFile(
          eventPath,
          `export default async function on${name[0].toUpperCase() + name.slice(1)}() {\n  console.log('${name} event fired!');\n};`,
        );

        return Logger.info(
          `Event ${name} created successfully at ${eventPath}.`,
        );
      }
      default:
        this.panic(message);
    }
  }
}
