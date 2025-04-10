import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { generateTypesPackage } from '../utils/types-package';

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
      const options = program.opts();
      return createProductionBuild(options.config);
    });

  program
    .command('create')
    .description('Create new commands or events files')
    .option('-c, --command', 'Create a new command')
    .option('-e, --event', 'Create a new event')
    .argument('<name>', 'The name of the command or event')
    .action(async (name, options) => {
      if (options.command) {
        await generateCommand(name);
      } else if (options.event) {
        await generateEvent(name);
      } else {
        console.error('Please specify what to create: --command or --event');
      }
    });

  const types = join(process.cwd(), 'node_modules', 'commandkit-types');

  if (!existsSync(types)) {
    await mkdir(types, { recursive: true }).catch(() => {});
    await generateTypesPackage(true).catch(() => {});
  }

  await program.parseAsync(argv, options);
}
