import { mkdir, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Locale } from 'discord.js';
import { panic } from './common';
import { existsSync } from 'fs';
import colors from '../utils/colors';

const BASE_PATH = process.cwd();
const COMMANDS_DIR = join(BASE_PATH, 'src/app/commands');
const EVENTS_DIR = join(BASE_PATH, 'src/app/events');

const formatPath = (path: string) =>
  path.replace(process.cwd(), '.').replace(/\\/g, '/');

function determineExtension() {
  return existsSync(join(BASE_PATH, 'tsconfig.json')) ? 'ts' : 'js';
}

function TS_COMMAND_SOURCE(name: string) {
  return `import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';

export const command: CommandData = {
  name: '${name}',
  description: '${name} command',
};

export const chatInput: ChatInputCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from ${name}!');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('Hello from ${name}!');
};
`;
}

function JS_COMMAND_SOURCE(name: string) {
  return `/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: '${name}',
  description: '${name} command',
};

/**
 * @type {import('commandkit').ChatInputCommand}
 */
export const chatInput = async (ctx) => {
  await ctx.interaction.reply('Hello from ${name}!');
};

/**
 * @type {import('commandkit').MessageCommand}
 */
export const message = async (ctx) => {
  await ctx.message.reply('Hello from ${name}!');
};
`;
}

export async function generateCommand(name: string, customPath?: string) {
  const cmdPath = join(customPath || COMMANDS_DIR);
  if (!existsSync(cmdPath)) await mkdir(cmdPath, { recursive: true });

  const ext = determineExtension();
  const isTypeScript = ext === 'ts';

  const fileName = `${name}.${ext}`;

  if (existsSync(join(cmdPath, fileName))) {
    panic(`Command ${name} already exists.`);
  }

  const commandFile = isTypeScript
    ? TS_COMMAND_SOURCE(name)
    : JS_COMMAND_SOURCE(name);

  await writeFile(join(cmdPath, fileName), commandFile);

  console.log(
    colors.green(
      `Command ${colors.magenta(name)} created at ${colors.blue(formatPath(`${cmdPath}/${fileName}`))}`,
    ),
  );
}

export async function generateEvent(name: string, customPath?: string) {
  const eventPath = join(customPath || EVENTS_DIR, name);
  if (!existsSync(eventPath)) await mkdir(eventPath, { recursive: true });

  const ext = determineExtension();

  let filename = `event.${ext}`;

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
