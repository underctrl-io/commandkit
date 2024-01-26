import { dirname, join } from 'node:path';
import { readdir } from 'node:fs/promises';

export interface CommandParserOptions {
    src: string;
    filter: (name: string) => boolean;
    maxDepth: number;
    extensions: RegExp;
}

export const enum CommandEntityKind {
    Command,
    ContextMenuCommand,
    Category,
    Subcommand,
    DynamicCommand,
    Validator,
}

const IGNORE_PATTERN = /^_/;
const CATEGORY_PATTERN = /^\([a-z0-9-_]{1,}\)$/;
const DYNAMIC_PATTERN = /^\[[a-z0-9-_]{1,}\]$/;

export interface CommandEntity {
    name: string;
    kind: CommandEntityKind;
    path: string;
    children: CommandEntity[];
    category: string | null;
}

export class CommandParser {
    #data: CommandEntity[] = [];

    public constructor(public readonly options: CommandParserOptions) {}

    public clear() {
        this.#data = [];
    }

    public getCommands() {
        return this.#data;
    }

    public async scan() {
        const { src, maxDepth } = this.options;

        const files = await this.#scanDir(src, maxDepth);

        this.#data.push(...files);

        return files;
    }

    public map(): Map<string, CommandEntity> {
        const map = new Map<string, CommandEntity>();

        for (const command of this.#data) {
            map.set(command.name, command);
        }

        return map;
    }

    async #scanDir(dir: string, depth: number) {
        const files: CommandEntity[] = [];

        for await (const dirent of await readdir(dir, { withFileTypes: true })) {
            if (!this.options.filter(dirent.name)) continue;

            if (dirent.isDirectory()) {
                if (depth > 0) {
                    if (CATEGORY_PATTERN.test(dirent.name)) {
                        const name = dirent.name.replace(/\(|\)/g, '');
                        const fullPath = join(dir, dirent.name);

                        files.push({
                            name,
                            path: fullPath,
                            kind: CommandEntityKind.Category,
                            children: (await this.#scanDir(fullPath, depth - 1)).map((e) => ({
                                ...e,
                                category: name,
                            })),
                            category: null,
                        });
                    } else {
                        const path = join(dir, dirent.name);

                        const nearestCategory =
                            path
                                .split('/')
                                .reverse()
                                .find((e) => CATEGORY_PATTERN.test(e)) ?? null;

                        // ignoring category pattern, if path is nested more than once, it is a subcommand
                        const isSubcommand =
                            path
                                .replace(this.options.src, '')
                                .split('/')
                                .filter((e) => !IGNORE_PATTERN.test(e)).length > 1;

                        const isDynamic = DYNAMIC_PATTERN.test(dirent.name);

                        files.push({
                            name: dirent.name,
                            kind: isSubcommand
                                ? CommandEntityKind.Subcommand
                                : isDynamic
                                ? CommandEntityKind.DynamicCommand
                                : CommandEntityKind.Command,
                            path,
                            children: [...(await this.#scanDir(path, depth - 1))],
                            category: nearestCategory,
                        });
                    }
                }
            } else {
                if (!this.options.extensions.test(dirent.name)) continue;

                const fullPath = join(dir, dirent.name);
                const name = dirent.name.replace(this.options.extensions, '');

                let kind: CommandEntityKind | null = null;

                switch (name) {
                    case 'command':
                        kind = CommandEntityKind.Command;
                        break;
                    case 'validator':
                        kind = CommandEntityKind.Validator;
                        break;
                    case 'context':
                        kind = CommandEntityKind.ContextMenuCommand;
                        break;
                    default:
                        break;
                }

                if (kind === null) continue;

                const nearestCategory =
                    fullPath
                        .split('/')
                        .reverse()
                        .find((e) => CATEGORY_PATTERN.test(e)) ?? null;

                files.push({
                    name: dirname(fullPath),
                    path: fullPath,
                    kind,
                    children: [],
                    category: nearestCategory,
                });
            }
        }

        return files;
    }
}
