import {
  CommandKitPluginRuntime,
  defineConfig,
  Logger,
  RuntimePlugin,
} from 'commandkit';

class ExtendedLogsPlugin extends RuntimePlugin {
  name = 'ExtendedLogsPlugin';

  async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    ctx.commandkit.client.on('typingStart', (typing) => {
      ctx.commandkit.events.to('extended').emit('messageTyping', typing);
    });

    Logger.info('ExtendedLogsPlugin activated');
  }

  async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    ctx.commandkit.client.removeAllListeners('typingStart');
  }
}

export default defineConfig({
  plugins: [new ExtendedLogsPlugin({})],
});
