import { describe, beforeAll, test, expect } from 'vitest';
import { CommandEntityKind, CommandParser } from '../helpers/command-parser';

describe('CommandParser', () => {
    const parser = new CommandParser({
        src: `${__dirname}/sample`,
        filter: (name) => !name.startsWith('_'),
        maxDepth: 5,
        extensions: /\.(c|m)?(j|t)sx?$/,
    });

    beforeAll(async () => {
        await parser.scan();
    });

    test('should scan all files', () => {
        expect(parser.getCommands().length).toBeGreaterThan(0);
    });

    test('should contain general category', () => {
        const cmds = parser.getCommands();
        const cat = cmds.find((c) => c.kind === CommandEntityKind.Category && c.name === 'general');

        expect(cat?.name).toBe('general');
    });

    test('general should contain commands', () => {
        const cmds = parser.getCommands();
        const cat = cmds.find((c) => c.kind === CommandEntityKind.Category && c.name === 'general');

        expect(cat?.children.length).toBeGreaterThan(0);
        expect(cat?.children.map((m) => m.name)).toEqual(['ping', 'pong']);
    });
});
