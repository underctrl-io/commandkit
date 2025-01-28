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

  await program.parseAsync(argv, options);
}
