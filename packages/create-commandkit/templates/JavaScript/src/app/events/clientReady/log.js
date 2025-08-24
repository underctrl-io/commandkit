import { Logger } from 'commandkit/logger';

/**
 * @type {import('commandkit').EventHandler<'ready'>}
 */
const handler = async (client) => {
  Logger.info(`Logged in as ${client.user.username}!`);
};

export default handler;
