import { CommandKitPluginRuntime, Logger, RuntimePlugin } from 'commandkit';
import { startServer } from './server/app';
import type { Server } from 'node:http';

export interface DevtoolsPluginOptions {
  /**
   * The port to use for the devtools server.
   * @default 3482
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
}

export class DevtoolsPlugin extends RuntimePlugin<DevtoolsPluginOptions> {
  public readonly name = 'DevtoolsPlugin';
  private server: Server | null = null;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.server = await startServer(this.options.port ?? 3482, ctx.commandkit);
    Logger.info(
      `Devtools server started on port ${this.options.port ?? 3482}.`,
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
    port: 3482,
    enableOnProduction: false,
    ...options,
  });
}
