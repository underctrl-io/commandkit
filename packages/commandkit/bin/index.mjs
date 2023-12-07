#!/usr/bin/env node

// @ts-check

import { Command } from 'commander';
import { bootstrapDevelopmentServer } from './development.mjs';
import { bootstrapProductionServer } from './production.mjs';
import { bootstrapProductionBuild } from './build.mjs';

const program = new Command('commandkit');

program
    .command('dev')
    .description('Start your bot in development mode.')
    .option('-c, --config <path>', 'Path to your commandkit config file.', './commandkit.js')
    .action(() => {
        const options = program.opts();
        bootstrapDevelopmentServer(options);
    });

program
    .command('start')
    .description('Start your bot in production mode after running the build command.')
    .option('-c, --config <path>', 'Path to your commandkit.json file.', './commandkit.js')
    .action(() => {
        const options = program.opts();
        bootstrapProductionServer(options.config);
    });

program
    .command('build')
    .description('Build your project for production usage.')
    .option('-c, --config <path>', 'Path to your commandkit.json file.', './commandkit.json')
    .action(() => {
        const options = program.opts();
        bootstrapProductionBuild(options.config);
    });

program.parse();
