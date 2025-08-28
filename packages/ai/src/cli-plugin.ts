import { type CompilerPluginRuntime, CompilerPlugin, Logger } from 'commandkit';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

const AI_CONFIG_TEMPLATE = `
import { configureAI } from '@commandkit/ai';
import { openai } from '@ai-sdk/openai';

configureAI({
  selectAiModel: async () => {
    return { model: openai('o3-mini') };
  }
});
`.trimStart();

export class AiCliPlugin extends CompilerPlugin {
  public readonly name = 'AiCliPlugin';

  private async handleTemplate(args: string[]) {
    if (!existsSync('./src')) {
      Logger.error(`No "src" directory found in the current directory`);
      return;
    }

    let filePath = './src/ai';
    const isTypeScript = existsSync('tsconfig.json');

    if (isTypeScript) {
      filePath += '.ts';
    } else {
      filePath += '.js';
    }

    if (existsSync(filePath)) {
      Logger.error(`AI config file already exists at ${filePath}`);
      return;
    }

    await writeFile(filePath, AI_CONFIG_TEMPLATE);

    Logger.info(`AI config file created at ${filePath}`);
  }

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    ctx.registerTemplate('ai', this.handleTemplate.bind(this));
  }

  public async deactivate(ctx: CompilerPluginRuntime): Promise<void> {
    ctx.unregisterTemplate('ai');
  }
}
