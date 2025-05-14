import {
  COMMANDKIT_BOOTSTRAP_MODE,
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
} from 'commandkit';
import { startServer } from './server/app';
import type { Server } from 'node:http';

const DEFAULT_PORT = 4356;

export interface DevtoolsPluginOptions {
  /**
   * The port to use for the devtools server.
   * @default 4356
   */
  port?: number;
  /**
   * Whether to enable the devtools on production.
   * @default false
   */
  enableOnProduction?: boolean;
  /**
   * The credential to use for the devtools server.
   */
  credential?: {
    username: string;
    password: string;
  };
  /**
   * Whether to bypass authentication in development mode.
   * @default true
   */
  bypassAuthInDev?: boolean;
}

export class DevtoolsPlugin extends RuntimePlugin<DevtoolsPluginOptions> {
  public readonly name = 'DevtoolsPlugin';
  private server: Server | null = null;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    if (
      !this.options.enableOnProduction &&
      COMMANDKIT_BOOTSTRAP_MODE === 'production'
    ) {
      return;
    }

    this.server = await startServer(
      this.options.port ?? DEFAULT_PORT,
      ctx.commandkit,
      this.options.bypassAuthInDev ? undefined : this.options.credential,
    );

    queueMicrotask(() =>
      Logger.info(
        `Devtools plugin started on port http://localhost:${this.options.port ?? DEFAULT_PORT}.`,
      ),
    );
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    void ctx;
    this.server?.close();
    this.server = null;
    Logger.info('Devtools server stopped.');
  }
}

export function devtools(options?: DevtoolsPluginOptions) {
  return new DevtoolsPlugin({
    port: DEFAULT_PORT,
    enableOnProduction: false,
    bypassAuthInDev: true,
    ...options,
  });
}
