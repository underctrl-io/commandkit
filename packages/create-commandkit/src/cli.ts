import { Command } from 'commander';
import type { CLIOptions } from './types.js';

export function parseCLI(): CLIOptions {
  const program = new Command();

  program
    .name('create-commandkit')
    .description('Effortlessly create a CommandKit project')
    .version(process.env.npm_package_version || '1.0.0')
    .argument('[project-directory]', 'Project directory name')
    .option('-h, --help', 'Show all available options')
    .option(
      '-e, --example <name-or-url>',
      'An example to bootstrap the app with',
    )
    .option(
      '--example-path <path>',
      'Specify the path to the example separately',
    )
    .option('--use-npm', 'Explicitly tell the CLI to bootstrap using npm')
    .option('--use-pnpm', 'Explicitly tell the CLI to bootstrap using pnpm')
    .option('--use-yarn', 'Explicitly tell the CLI to bootstrap using yarn')
    .option('--use-bun', 'Explicitly tell the CLI to bootstrap using bun')
    .option('--use-deno', 'Explicitly tell the CLI to bootstrap using deno')
    .option(
      '--skip-install',
      'Explicitly tell the CLI to skip installing packages',
    )
    .option('--no-git', 'Explicitly tell the CLI to disable git initialization')
    .option('--yes', 'Use previous preferences or defaults for all options')
    .option(
      '--list-examples',
      'List all available examples from the official repository',
    );

  program.parse();

  const options = program.opts();
  const args = program.args;

  return {
    help: options.help,
    example: options.example,
    examplePath: options.examplePath,
    useNpm: options.useNpm,
    usePnpm: options.usePnpm,
    useYarn: options.useYarn,
    useBun: options.useBun,
    useDeno: options.useDeno,
    skipInstall: options.skipInstall,
    noGit: options.noGit,
    yes: options.yes,
    listExamples: options.listExamples,
    projectDirectory: args[0],
  };
}
