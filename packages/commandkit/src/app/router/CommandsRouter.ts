import { Collection } from 'discord.js';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import Walk from '@root/walk';
import path from 'node:path';

export interface ParsedCommand {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  category: string | null;
  subcommands: ParsedSubCommand[];
  middlewareIds: string[];
}

export interface ParsedMiddleware {
  id: string;
  path: string;
  relativePath: string;
}

export interface ParsedSubCommand {
  name: string;
  group: string | null;
  path: string;
  relativePath: string;
  command: string;
}

export interface CommandsRouterOptions {
  entrypoint: string;
}

export interface CommandsRouterData {
  commands: Collection<string, ParsedCommand>;
  middlewares: Collection<string, ParsedMiddleware>;
}

export interface CommandsRouterRawData {
  commands: Record<string, ParsedCommand>;
  middlewares: Record<string, ParsedMiddleware>;
}

export class CommandsRouter {
  private commands: Collection<string, ParsedCommand> = new Collection();
  private middlewares: Collection<string, ParsedMiddleware> = new Collection();
  public constructor(private readonly options: CommandsRouterOptions) {}

  public fromData(data: CommandsRouterRawData) {
    this.commands = new Collection(
      Object.entries(data.commands).map(([id, command]) => [id, command]),
    );

    this.middlewares = new Collection(
      Object.entries(data.middlewares).map(([id, middleware]) => [
        id,
        middleware,
      ]),
    );
  }

  public isValidPath() {
    return existsSync(this.options.entrypoint);
  }

  public getData(): CommandsRouterData {
    return {
      commands: this.commands,
      middlewares: this.middlewares,
    };
  }

  public toJSON(): CommandsRouterRawData {
    return {
      commands: Object.fromEntries(this.commands.entries()),
      middlewares: Object.fromEntries(this.middlewares.entries()),
    };
  }

  public clear() {
    this.commands.clear();
    this.middlewares.clear();
  }

  public reload(): Promise<CommandsRouterRawData> {
    this.clear();
    return this.scan();
  }

  public async scan(): Promise<CommandsRouterRawData> {
    if (!this.isValidPath()) {
      throw new Error('Invalid path');
    }

    await this.traverse();
    this.applyBindings();

    return this.toJSON();
  }

  private async traverse() {
    const validFile = /\.(c|m)?(j|t)sx?$/;
    const middleware = /^(\w+\.)?middleware\.(c|m)?(j|t)sx?$/;
    const categoryDir = /^\((\w+)\)$/;

    const isCategory = (name: string) => categoryDir.test(name);
    const isMiddleware = (name: string) => middleware.test(name);
    const isCommand = (name: string) =>
      validFile.test(name) && !isMiddleware(name);

    // First pass: collect all root command files
    await Walk.walk(
      this.options.entrypoint,
      async (error, pathname, dirent) => {
        if (error) throw error;

        const name = dirent.name;

        if (dirent.isDirectory()) {
          if (isCategory(name) && this.distanceFromRoot(pathname) > 1) {
            throw new Error(
              `Category directories must be at the root. Found "${name}" at "${pathname}"`,
            );
          }
          return;
        }

        // Skip non-root level files in first pass
        if (this.distanceFromRoot(pathname, true) > 1) return;

        // Handle middlewares
        if (isMiddleware(name)) {
          const middleware: ParsedMiddleware = {
            id: crypto.randomUUID(),
            path: pathname,
            relativePath: this.toRelativePath(pathname),
          };
          this.middlewares.set(middleware.id, middleware);
          return;
        }

        if (!isCommand(name)) return;

        // This is a root command
        const command: ParsedCommand = {
          id: crypto.randomUUID(),
          name: this.parseFileName(name),
          category: this.parseCategory(pathname),
          middlewareIds: [],
          path: pathname,
          relativePath: this.toRelativePath(pathname),
          subcommands: [],
        };
        this.commands.set(command.id, command);
      },
    );

    // Second pass: collect subcommands and nested middlewares
    await Walk.walk(
      this.options.entrypoint,
      async (error, pathname, dirent) => {
        if (error) throw error;

        const name = dirent.name;

        if (dirent.isDirectory()) return;

        // Skip root level files in second pass
        if (this.distanceFromRoot(pathname, true) <= 1) return;

        // Handle nested middlewares
        if (isMiddleware(name)) {
          const middleware: ParsedMiddleware = {
            id: crypto.randomUUID(),
            path: pathname,
            relativePath: this.toRelativePath(pathname),
          };
          this.middlewares.set(middleware.id, middleware);
          return;
        }

        if (!isCommand(name)) return;

        // Find the parent command by walking up the directory tree
        let currentDir = path.dirname(pathname);
        let parentCommand: ParsedCommand | undefined;

        while (currentDir !== this.options.entrypoint) {
          const dirName = path.basename(currentDir);
          parentCommand = Array.from(this.commands.values()).find(
            (cmd) =>
              path.basename(path.dirname(cmd.path)) ===
                path.basename(path.dirname(currentDir)) &&
              this.parseFileName(cmd.path) === dirName,
          );
          if (parentCommand) break;
          currentDir = path.dirname(currentDir);
        }

        if (parentCommand) {
          // This is a subcommand
          const subcommand: ParsedSubCommand = {
            name: this.parseFileName(name),
            group: this.parseGroup(pathname),
            path: pathname,
            relativePath: this.toRelativePath(pathname),
            command: parentCommand.id,
          };
          parentCommand.subcommands.push(subcommand);
        }
      },
    );
  }

  private applyBindings() {
    // For each command, find its associated middlewares
    for (const command of this.commands.values()) {
      const commandName = command.name;
      const commandDir = path.dirname(command.path);

      // Find middlewares in the same directory or its parent directories
      for (const middleware of this.middlewares.values()) {
        const middlewareDir = path.dirname(middleware.path);
        const middlewareFileName = path.basename(middleware.path);
        const isCommandSpecificMiddleware = middlewareFileName.startsWith(
          commandName + '.',
        );
        const isSharedMiddleware =
          middlewareFileName === 'middleware.ts' ||
          middlewareFileName === 'middleware.js';

        // Command-specific middleware: Must match the command name prefix
        if (
          isCommandSpecificMiddleware &&
          middlewareFileName.startsWith(commandName + '.')
        ) {
          command.middlewareIds.push(middleware.id);
          continue;
        }

        // Shared middleware: Must be in the same directory or parent directory
        if (isSharedMiddleware) {
          // Check if middleware is in same directory or a parent directory of the command
          const relPath = path.relative(middlewareDir, commandDir);
          if (!relPath.startsWith('..') && !path.isAbsolute(relPath)) {
            command.middlewareIds.push(middleware.id);
          }
        }
      }
    }
  }

  private distanceFromRoot(pathname: string, isFile = false) {
    const entrypointParts = this.options.entrypoint.split(path.sep);
    const pathParts = (!isFile ? pathname : path.dirname(pathname)).split(
      path.sep,
    );

    // Get the parts after the entrypoint by finding where the paths diverge
    const relativeParts = pathParts.slice(entrypointParts.length);

    // Filter out category directories and count remaining parts
    return relativeParts.filter((part) => !part.match(/^\(.*\)$/)).length;
  }

  private parseGroup(pathname: string) {
    const parts = pathname.split(path.sep);
    const parentDirIndex = parts.findIndex((part) =>
      this.commands.some((cmd) => cmd.name === part),
    );

    if (parentDirIndex === -1) return null;

    // Get the immediate parent directory name (the group)
    // Skipping the command directory and file name
    const groupName = parts[parts.length - 2];

    // Don't include it as group if it's the command name itself or a category
    if (
      !groupName ||
      groupName === parts[parentDirIndex] ||
      groupName.match(/^\(.*\)$/)
    ) {
      return null;
    }

    return groupName;
  }

  private parseCategory(pathname: string) {
    const parts = pathname.split(path.sep);
    const entrypointParts = this.options.entrypoint.split(path.sep);
    const relativeIndex = entrypointParts.length;

    // Only check for category in the first directory after entrypoint
    const categoryDir = parts[relativeIndex];
    if (!categoryDir || !/^\((\w+)\)$/.test(categoryDir)) {
      return null;
    }

    return categoryDir.slice(1, -1);
  }

  private parseFileName(filename: string) {
    return path.basename(filename, path.extname(filename));
  }

  private toRelativePath(pathname: string) {
    return path.relative(this.options.entrypoint, pathname);
  }
}
