import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { initializeDevelopmentEnvironment } from './actions/development';

yargs(hideBin(process.argv))
    .scriptName('commandkit')
    .command(
        'dev',
        'Start the bot in development mode',
        () => {},
        async (args) => {
            await initializeDevelopmentEnvironment(args);
        },
    )
    .command('start', 'Start the production build')
    .command('build', 'Generate production build of the project')
    .options({
        config: {
            alias: 'c',
            type: 'string',
            description: 'Path to the commandkit config file',
        },
        nodeOptions: {
            alias: 'n',
            type: 'string',
            description: 'Node options to pass to the process',
        },
    })
    .version('[VI]{{inject}}[/VI]')
    .help()
    .demandCommand()
    .parse();
