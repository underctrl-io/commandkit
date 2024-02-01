// @ts-check

import { defineConfig } from '../dist/index.mjs';

export default defineConfig({
    clientOptions: {
        intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
    },
    token: process.env.DISCORD_TOKEN,
});
