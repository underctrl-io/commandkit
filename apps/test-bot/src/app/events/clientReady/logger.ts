import { EventHandler, Logger } from 'commandkit';

const handler: EventHandler<'clientReady'> = (client) => {
  Logger.log(`Successfully logged in as ${client.user?.tag}`);
};

export default handler;
