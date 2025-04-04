import { CommandKit } from './CommandKit';

export default CommandKit;

export * from './CommandKit';
export * from './components';
export * from './config/config';
export * from './context/async-context';
export * from './context/environment';
export * from './cache/index';
export * from './app/index';
export * from './logger/DefaultLogger';
export * from './logger/ILogger';
export * from './logger/Logger';
export * from './app/router/index';
export type * from './types';
export * from './version';
export * from './plugins/index';
export {
  getCurrentDirectory,
  getSourceDirectories,
  devOnly,
  debounce,
} from './utils/utilities';
export type { CommandKitHMREvent } from './utils/dev-hooks';
export * from './utils/constants';

// cli
export { bootstrapCommandkitCLI } from './cli/init';
