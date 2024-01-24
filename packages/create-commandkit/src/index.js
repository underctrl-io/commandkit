#!/usr/bin/env node
console.clear();

const prompts = require('@clack/prompts');

const { gray, cyan } = require('colors');
const { commandkit, hints, outroMsg } = require('./constants');

const setup = require('./functions/setup');
const installDeps = require('./functions/installDeps');
const copyTemplates = require('./functions/copyTemplates');

const path = require('path');
const fs = require('fs-extra');

(async () => {
    prompts.intro(`Welcome to ${commandkit}!`);

    const dir = path.resolve(
        process.cwd(),
        await prompts.text({
            message: 'Enter a project directory:',
            placeholder: 'Leave blank for current directory',
            defaultValue: '.',
            validate: (value) => {
                value = path.resolve(process.cwd(), value);
                let isEmpty;

                try {
                    const contents = fs.readdirSync(value);
                    isEmpty = contents.length === 0;
                } catch {
                    isEmpty = true;
                }

                return isEmpty ? undefined : 'Directory is not empty!';
            },
        }),
    );

    const manager = await prompts.select({
        message: 'Select a package manager:',
        options: [{ value: 'npm' }, { value: 'pnpm' }, { value: 'yarn' }],
    });

    const type = await prompts.select({
        message: 'Select a module type:',
        options: [
            { label: 'CommonJS', value: 'cjs', hint: `${hints.require} & ${hints.module}` },
            { label: 'ES Modules', value: 'esm', hint: `${hints.import} & ${hints.export}` },
        ],
    });

    const token = await prompts.password({
        message: 'Enter your bot token:',
        mask: gray('*'),
    });

    prompts.outro(cyan('Setup complete.'));

    await setup({ manager, dir, token, type });
    await copyTemplates({ type, dir, lang: 'js' });
    await installDeps({ manager, dir, stdio: 'inherit' });

    console.log(outroMsg);
})();
