import { afterEach, describe, expect, test } from 'vitest';
import { Client, Collection, Message } from 'discord.js';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CommandKit } from '../../commandkit';
import { AppCommandHandler } from './AppCommandHandler';
import { CommandsRouter } from '../router';

const tmpRoots: string[] = [];
const tempBaseDir = join(__dirname, '.tmp');

async function createCommandsFixture(
  files: Array<[relativePath: string, contents?: string]>,
) {
  await mkdir(tempBaseDir, { recursive: true });

  const root = await mkdtemp(join(tempBaseDir, 'alias-resolution-'));
  tmpRoots.push(root);

  for (const [relativePath, contents = 'export {};'] of files) {
    const fullPath = join(root, relativePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, contents);
  }

  return root;
}

function createMessage(content: string) {
  const message = Object.create(Message.prototype) as Message & {
    attachments: Collection<string, unknown>;
    author: { bot: boolean };
    channel: null;
    channelId: string;
    guild: null;
    guildId: string;
    mentions: {
      channels: Collection<string, unknown>;
      roles: Collection<string, unknown>;
      users: Collection<string, unknown>;
    };
  };

  Object.defineProperties(message, {
    attachments: {
      value: new Collection(),
      writable: true,
    },
    author: {
      value: { bot: false },
      writable: true,
    },
    content: {
      value: content,
      writable: true,
    },
    channel: {
      value: null,
      writable: true,
    },
    channelId: {
      value: 'channel-1',
      writable: true,
    },
    guild: {
      value: null,
      writable: true,
    },
    guildId: {
      value: 'guild-1',
      writable: true,
    },
    mentions: {
      value: {
        channels: new Collection(),
        roles: new Collection(),
        users: new Collection(),
      },
      writable: true,
    },
  });

  return message;
}

afterEach(async () => {
  CommandKit.instance = undefined;
  await Promise.all(
    tmpRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('AppCommandHandler.prepareCommandRun - alias resolution', () => {
  test('resolves a prefix command alias without an explicit cmdName override', async () => {
    const files: Array<[string, string]> = [
      [
        'testing.mjs',
        `
export const command = { name: 'testing', description: 'Test command' };
export const metadata = { aliases: ['t'] };
export async function message() {}
`,
      ],
    ];

    const entrypoint = await createCommandsFixture(files);
    const client = new Client({ intents: [] });
    const commandkit = new CommandKit({ client });
    const handler = new AppCommandHandler(commandkit);
    const router = new CommandsRouter({ entrypoint });

    commandkit.commandHandler = handler;
    commandkit.commandsRouter = router;
    commandkit.appConfig.getMessageCommandPrefix = () => ['!'];

    await router.scan();
    await handler.loadCommands();

    const message = createMessage('!t');
    const prepared = await handler.prepareCommandRun(message);

    expect(prepared).not.toBeNull();
    expect(prepared!.command.data.command.name).toBe('testing');

    await client.destroy();
  });

  test('resolves the primary command name via prefix', async () => {
    const files: Array<[string, string]> = [
      [
        'testing.mjs',
        `
export const command = { name: 'testing', description: 'Test command' };
export const metadata = { aliases: ['t'] };
export async function message() {}
`,
      ],
    ];

    const entrypoint = await createCommandsFixture(files);
    const client = new Client({ intents: [] });
    const commandkit = new CommandKit({ client });
    const handler = new AppCommandHandler(commandkit);
    const router = new CommandsRouter({ entrypoint });

    commandkit.commandHandler = handler;
    commandkit.commandsRouter = router;
    commandkit.appConfig.getMessageCommandPrefix = () => ['!'];

    await router.scan();
    await handler.loadCommands();

    const message = createMessage('!testing');
    const prepared = await handler.prepareCommandRun(message);

    expect(prepared).not.toBeNull();
    expect(prepared!.command.data.command.name).toBe('testing');

    await client.destroy();
  });

  test('does not alias-match hierarchical dotted routes', async () => {
    const files: Array<[string, string]> = [
      [
        'testing.mjs',
        `
export const command = { name: 'testing', description: 'Test command' };
export const metadata = { aliases: ['admin'] };
export async function message() {}
`,
      ],
      [
        '[admin]/command.mjs',
        `export const command = { description: 'Admin' };`,
      ],
      [
        '[admin]/{moderation}/group.mjs',
        `export const command = { description: 'Moderation' };`,
      ],
      [
        '[admin]/{moderation}/ban.subcommand.mjs',
        `
export const command = { description: 'Ban' };
export async function message() {}
`,
      ],
    ];

    const entrypoint = await createCommandsFixture(files);
    const client = new Client({ intents: [] });
    const commandkit = new CommandKit({ client });
    const handler = new AppCommandHandler(commandkit);
    const router = new CommandsRouter({ entrypoint });

    commandkit.commandHandler = handler;
    commandkit.commandsRouter = router;
    commandkit.appConfig.getMessageCommandPrefix = () => ['!'];

    await router.scan();
    await handler.loadCommands();

    const message = createMessage('!admin:moderation:ban');
    const prepared = await handler.prepareCommandRun(message);

    expect(prepared).not.toBeNull();
    expect(
      (prepared!.command.data.command as Record<string, any>).__routeKey,
    ).toBe('admin.moderation.ban');

    await client.destroy();
  });

  test('returns null for an unknown command', async () => {
    const files: Array<[string, string]> = [
      [
        'testing.mjs',
        `
export const command = { name: 'testing', description: 'Test command' };
export const metadata = { aliases: ['t'] };
export async function message() {}
`,
      ],
    ];

    const entrypoint = await createCommandsFixture(files);
    const client = new Client({ intents: [] });
    const commandkit = new CommandKit({ client });
    const handler = new AppCommandHandler(commandkit);
    const router = new CommandsRouter({ entrypoint });

    commandkit.commandHandler = handler;
    commandkit.commandsRouter = router;
    commandkit.appConfig.getMessageCommandPrefix = () => ['!'];

    await router.scan();
    await handler.loadCommands();

    const message = createMessage('!unknown');
    const prepared = await handler.prepareCommandRun(message);

    expect(prepared).toBeNull();

    await client.destroy();
  });
});
