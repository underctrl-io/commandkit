import { mkdir, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Locale } from 'discord.js';
import { panic } from './common';
import { existsSync } from 'fs';
import colors from '../utils/colors';

const BASE_PATH = process.cwd();
const COMMANDS_DIR = join(BASE_PATH, 'src/app/commands');
const EVENTS_DIR = join(BASE_PATH, 'src/app/events');
const LOCALES_DIR = join(BASE_PATH, 'src/app/locales');

const formatPath = (path: string) =>
  path.replace(process.cwd(), '.').replace(/\\/g, '/');

export async function generateCommand(name: string, customPath?: string) {
  const cmdPath = join(customPath || COMMANDS_DIR, name);
  if (!existsSync(cmdPath)) await mkdir(cmdPath, { recursive: true });

  if (existsSync(join(cmdPath, 'command.ts'))) {
    panic(`Command ${name} already exists.`);
  }

  const commandFile = `
import type { CommandData, SlashCommand, MessageCommand } from 'commandkit';

export const data: CommandData = {
  name: '${name}',
  description: '${name} command',
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from ${name}!');
};

export const message: MessageCommand = async (ctx) => {
    await ctx.message.reply('Hello from ${name}!');
};
`.trim();

  await writeFile(join(cmdPath, 'command.ts'), commandFile);

  console.log(
    colors.green(
      `Command ${colors.magenta(name)} created at ${colors.blue(formatPath(cmdPath))}/command.ts`,
    ),
  );
}

export async function generateEvent(name: string, customPath?: string) {
  const eventPath = join(customPath || EVENTS_DIR, name);
  if (!existsSync(eventPath)) await mkdir(eventPath, { recursive: true });

  let filename = 'event.ts';
  if (existsSync(join(eventPath, filename))) {
    const count = (await readdir(eventPath)).length;
    filename = `${String(count).padStart(2, '0')}_${filename}`;
  }

  const eventFile = `
export default async function on${name[0].toUpperCase() + name.slice(1)}() {
  console.log('${name} event fired!');
};
`.trim();

  await writeFile(join(eventPath, filename), eventFile);

  console.log(
    colors.green(
      `Event ${colors.magenta(name)} created at ${colors.blue(formatPath(eventPath))}/${colors.magenta(filename)}`,
    ),
  );
}

export async function generateLocale(
  locale: keyof typeof Locale,
  commandName: string,
  customPath?: string,
) {
  const localeNames = Object.fromEntries(
    Object.entries(Locale).map(([k, v]) => [v, k]),
  );

  if (!localeNames[locale]) {
    panic(`Invalid locale: ${locale}`);
  }

  if (!commandName) {
    panic('Command name is required.');
  }

  const localePath = join(customPath || LOCALES_DIR, locale);

  if (!existsSync(localePath)) await mkdir(localePath, { recursive: true });

  if (existsSync(join(localePath, `${commandName}.json`))) {
    panic(`Locale file for ${commandName} already exists.`);
  }

  const localeFile = {
    command: {
      name: `${commandName}`,
      description: `${commandName} command`,
    },
    translations: {},
  };

  await writeFile(
    join(localePath, `${commandName}.json`),
    JSON.stringify(localeFile, null, 2),
  );

  console.log(
    colors.green(
      `Locale file for ${colors.magenta(commandName)} created at ${colors.blue(
        formatPath(localePath),
      )}/${colors.magenta(`${commandName}.json`)}`,
    ),
  );
}
