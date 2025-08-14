import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { generateTypesPackage } from '../utils/types-package';
import { loadConfigFile } from '../config/loader';
import {
  CompilerPlugin,
  CompilerPluginRuntime,
  isCompilerPlugin,
} from '../plugins';
import { panic } from './common';
import { COMMANDKIT_CWD } from '../utils/constants';

/**
 * Creates a command line interface for CommandKit.
 * @param argv The arguments passed to the CLI.
 * @param options The options passed to the CLI.
 */
export async function bootstrapCommandkitCLI(
  argv: string[],
  options?: import('commander').ParseOptions | undefined,
) {
  process.title = 'CommandKit CLI';

  // imports are lazily loaded when the cli is used, instead of loading it with the lib itself
  const { Command } = await import('commander');
  const { bootstrapDevelopmentServer } = await import('./development');
  const { bootstrapProductionServer, createProductionBuild } = await import(
    './production'
  );
  const { generateCommand, generateEvent } = await import('./generators');
  const { version } = await import('../version');
  const { showInformation } = await import('./information');
  const { setCLIEnv } = await import('./env');

  const program = new Command('commandkit');

  program
    .command('dev')
    .version(version)
    .description('Start your bot in development mode.')
    .option(
      '-c, --config [path]',
      'Path to your commandkit config file.',
      './commandkit.js',
    )
    .action(() => {
      const options = program.opts();
      bootstrapDevelopmentServer(options.config);
    });

  program
    .command('info')
    .description(
      'Show information about the system which can be used to report bugs.',
    )
    .action(async () => {
      await showInformation();
    });

  program
    .command('start')
    .description(
      'Start your bot in production mode after running the build command.',
    )
    .option('-c, --config [path]', 'Path to your commandkit config file.')
    .action(() => {
      const options = program.opts();
      bootstrapProductionServer(options.config);
    });

  program
    .command('build')
    .description('Build your project for production usage.')
    .option('-c, --config [path]', 'Path to your commandkit config file.')
    .action(() => {
      setCLIEnv();
      const options = program.opts();
      return createProductionBuild(options.config);
    });

  program
    .command('create')
    .description(
      'Create new files using built-in templates or custom plugin templates',
    )
    .argument(
      '<template>',
      'The template to use (e.g. command, event, or custom plugin template)',
    )
    .argument('[args...]', 'Additional arguments for the template')
    .action(async (template, args) => {
      setCLIEnv();

      // Handle custom plugin templates
      const { plugins } = await loadConfigFile();
      const runtime = new CompilerPluginRuntime(
        plugins.filter((p) => isCompilerPlugin(p)) as CompilerPlugin[],
      );

      try {
        await runtime.init();
        const templateHandler = runtime.getTemplate(template);

        if (!templateHandler) {
          // Handle built-in templates
          if (template === 'command') {
            const [name] = args;
            if (!name) {
              panic('Command name is required');
            }
            await generateCommand(name);
            return;
          }

          if (template === 'event') {
            const [name] = args;
            if (!name) {
              panic('Event name is required');
            }
            await generateEvent(name);
            return;
          }

          const valid = Array.from(
            new Set([
              'command',
              'event',
              ...Array.from(runtime.getTemplates().keys()),
            ]),
          ).map((t) => `"${t}"`);

          panic(
            `Template "${template}" not found. Available templates: ${valid.join(', ')}`,
          );
        }

        await templateHandler(args);
      } catch (e: any) {
        panic(`Failed to execute template "${template}": ${e?.message || e}`);
      } finally {
        await runtime.destroy();
      }
    });

  const types = join(COMMANDKIT_CWD, 'node_modules', 'commandkit-types');

  if (!existsSync(types)) {
    await mkdir(types, { recursive: true }).catch(() => {});
    await generateTypesPackage(true).catch(() => {});
  }

  await program.parseAsync(argv, options);
}
