import { describe, expect, test } from 'vitest';
import { CommandKit } from '../src/index';
import { Client } from 'discord.js';

describe('CommandKit', () => {
  test('Creates CommandKit constructor', async () => {
    const client = new Client({
      intents: [],
    });

    const commandkit = new CommandKit({
      client,
    });

    expect(commandkit).toBeInstanceOf(CommandKit);
    expect(commandkit.client).toBe(client);

    await client.destroy();
  });
});
