import CommandKit from 'commandkit';
import type { Client } from 'discord.js';

let commandkit: CommandKit | null = null;

export function setCommandKit(instance: CommandKit) {
  commandkit = instance;
}

export function getCommandKit(): CommandKit {
  return commandkit!;
}

export function getClient(): Client {
  return getCommandKit().client;
}
