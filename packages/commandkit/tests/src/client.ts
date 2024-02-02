import { client, CommandKit } from '../../dist/index.mjs';

new CommandKit({
  client: client(),
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  validationsPath: `${__dirname}/validations`,
  // devGuildIds: process.env.DEV_GUILD_ID?.split(',') ?? [],
  // devUserIds: process.env.DEV_USER_ID?.split(',') ?? [],
  bulkRegister: true,
});
