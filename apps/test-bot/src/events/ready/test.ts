import { type EventHandler, Logger } from 'commandkit';

export const once = true;

const handler: EventHandler<'clientReady'> = (client, c, commandkit) => {
  Logger.log(`Ready from legacy event handler: ${client.user.username}`);
};

export default handler;
