import CommandKit from 'commandkit';
import type { Client } from 'discord.js';

export interface Credentials {
  username: string;
  password: string;
}

let commandkit: CommandKit | null = null;
let config: {
  credential?: Credentials;
} = {};

export function setConfig(newConfig: Partial<typeof config>) {
  config = {
    ...config,
    ...newConfig,
  };
}

export function getConfig(): typeof config {
  return config;
}

export function setCommandKit(instance: CommandKit) {
  commandkit = instance;
}

export function getCommandKit(): CommandKit {
  return commandkit!;
}

export function getClient(): Client<true> {
  return getCommandKit().client as Client<true>;
}
