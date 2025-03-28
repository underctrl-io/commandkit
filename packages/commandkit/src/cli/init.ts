import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

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
  const { generateCommand, generateEvent, generateLocale } = await import(
    './generators'
  );
  const { version } = await import('../version');

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
    .command('start')
    .description(
      'Start your bot in production mode after running the build command.',
    )
    .option('-c, --config [path]', 'Path to your commandkit.json file.')
    .action(() => {
      const options = program.opts();
      bootstrapProductionServer(options.config);
    });

  program
    .command('build')
    .description('Build your project for production usage.')
    .option('-c, --config [path]', 'Path to your commandkit.json file.')
    .action(() => {
      const options = program.opts();
      return createProductionBuild(options.config);
    });

  program
    .command('create')
    .description('Create new commands, events, or locale files')
    .option('-c, --command', 'Create a new command')
    .option('-e, --event', 'Create a new event')
    .option(
      '-l, --locale <locale>',
      'Specify the locale code (e.g. nl, es, fr)',
    )
    .argument('<name>', 'The name of the command or event')
    .action(async (name, options) => {
      if (options.command) {
        await generateCommand(name);
      } else if (options.event) {
        await generateEvent(name);
      } else if (options.locale) {
        if (!name) {
          console.error('Please specify a command name for the locale file');
          return;
        }
        await generateLocale(options.locale, name);
      } else {
        console.error(
          'Please specify what to create: --command, --event, or --locale',
        );
      }
    });

  await program.parseAsync(argv, options);

  const types = join(process.cwd(), 'node_modules', 'commandkit-types');

  if (!existsSync(types)) {
    await mkdir(types, { recursive: true }).catch(() => {});
  }
}
