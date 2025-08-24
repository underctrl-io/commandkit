import { type EventHandler, Logger } from 'commandkit';

export const once = true;

const handler: EventHandler<'clientReady'> = (client, c, commandkit) => {
  Logger.info`Ready from legacy event handler: ${client.user}`;
};

export default handler;
