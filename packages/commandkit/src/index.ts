import { CommandKit } from './CommandKit';

export default CommandKit;

export * from './CommandKit';
export * from './components';
export * from './config/config';
export * from './context/async-context';
export * from './context/environment';
export * from './app/index';
export * from './logger/DefaultLogger';
export * from './logger/ILogger';
export * from './logger/Logger';
export * from './app/router/index';
export type * from './types';
export * from './version';
export * from './plugins/index';
export * from './flags/feature-flags';
export {
  getCurrentDirectory,
  getSourceDirectories,
  devOnly,
  debounce,
  defer,
} from './utils/utilities';
export * from './app/interrupt/signals';
export type { CommandKitHMREvent } from './utils/dev-hooks';
export * from './utils/constants';
export * from './app/events/EventWorkerContext';

// cli
export { bootstrapCommandkitCLI } from './cli/init';
