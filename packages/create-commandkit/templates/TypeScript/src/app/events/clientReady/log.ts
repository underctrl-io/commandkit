import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';

const handler: EventHandler<'ready'> = async (client) => {
  Logger.info(`Logged in as ${client.user.username}!`);
};

export default handler;
