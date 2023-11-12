#!/usr/bin/env node

// @ts-check

import { Command } from 'commander';
import { bootstrapDevelopmentServer } from './dev-server.mjs';
import { bootstrapProductionBuild } from './build.mjs';

const program = new Command('commandkit');

program.command('dev')
    .description('Start your bot in development mode.')
    .option('-c, --config <path>', 'Path to your commandkit.json file.', './commandkit.json')
    .action(() => {
        const options = program.opts();
        bootstrapDevelopmentServer(options.config)
    });

program.command('build')
    .description('Build your project for production usage.')
    .option('-c, --config <path>', 'Path to your commandkit.json file.', './commandkit.json')
    .action(() => {
        const options = program.opts();
        bootstrapProductionBuild(options.config)
    });

program.parse();