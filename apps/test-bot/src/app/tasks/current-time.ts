import { task } from '@commandkit/tasks';
import { Logger } from 'commandkit';

export default task({
  name: 'current-time',
  immediate: true,
  schedule: '*/10 * * * * *', // every 10 seconds
  async execute() {
    Logger.info(`The current time is ${new Date().toLocaleString()}`);
  },
});
