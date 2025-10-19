#!/usr/bin/env node

import { bootstrapCommandkitCLI } from '../dist/cli/init.js';

await bootstrapCommandkitCLI(process.argv);
