/**
 * Creates a command line interface for CommandKit.
 * @param argv The arguments passed to the CLI.
 * @param options The options passed to the CLI.
 */
export async function bootstrapCommandkitCLI(
  argv: string[],
  options?: import('commander').ParseOptions | undefined,
) {
  const { Command } = await import('commander');
  const { bootstrapDevelopmentServer } = await import('./development');
  const { bootstrapProductionServer } = await import('./production');
  const { bootstrapProductionBuild } = await import('./build');
  const { generateCommand, generateEvent, generateLocale } = await import(
    './generators'
  );

  const program = new Command('commandkit');

  program
    .command('dev')
    .description('Start your bot in development mode.')
    .option(
      '-c, --config <path>',
      'Path to your commandkit config file.',
      './commandkit.js',
    )
    .action(() => {
      const options = program.opts();
      bootstrapDevelopmentServer(options);
    });

  program
    .command('start')
    .description(
      'Start your bot in production mode after running the build command.',
    )
    .option(
      '-c, --config <path>',
      'Path to your commandkit.json file.',
      './commandkit.js',
    )
    .action(() => {
      const options = program.opts();
      bootstrapProductionServer(options.config);
    });

  program
    .command('build')
    .description('Build your project for production usage.')
    .option(
      '-c, --config <path>',
      'Path to your commandkit.json file.',
      './commandkit.json',
    )
    .action(() => {
      const options = program.opts();
      bootstrapProductionBuild(options.config);
    });

  program
    .command('create')
    .description('Create new commands, events, or locale files')
    .option('-c, --command <name>', 'Create a new command')
    .option('-e, --event <name>', 'Create a new event')
    .option(
      '-l, --locale <locale> <command>',
      'Create a new locale file for the given command',
    )
    .action(async (options) => {
      if (options.command) {
        await generateCommand(options.command);
      } else if (options.event) {
        await generateEvent(options.event);
      } else if (options.locale) {
        const [locale, command] = options.locale;
        await generateLocale(locale, command);
      } else {
        console.error(
          'Please specify what to create: --command, --event, or --locale',
        );
      }
    });

  await program.parseAsync(argv, options);
}
