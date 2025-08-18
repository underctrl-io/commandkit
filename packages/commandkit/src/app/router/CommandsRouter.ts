import { Collection } from 'discord.js';
import { Dirent, existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, extname, join, normalize } from 'node:path';

/**
 * Represents a command with its metadata and middleware associations.
 */
export interface Command {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  parentPath: string;
  middlewares: Array<string>;
  category: string | null;
}

/**
 * Represents a middleware with its metadata and scope.
 */
export interface Middleware {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  parentPath: string;
  global: boolean;
  command: string | null;
}

/**
 * Data structure containing parsed commands and middleware.
 */
export interface ParsedCommandData {
  commands: Record<string, Command>;
  middlewares: Record<string, Middleware>;
}

/**
 * Configuration options for the commands router.
 */
export interface CommandsRouterOptions {
  entrypoint: string;
}

/**
 * @private
 * @internal
 */
const MIDDLEWARE_PATTERN = /^\+middleware\.(m|c)?(j|t)sx?$/;

/**
 * @private
 * @internal
 */
const COMMAND_MIDDLEWARE_PATTERN =
  /^\+([^+().][^().]*)\.middleware\.(m|c)?(j|t)sx?$/;

/**
 * @private
 * @internal
 */
const GLOBAL_MIDDLEWARE_PATTERN = /^\+global-middleware\.(m|c)?(j|t)sx?$/;

/**
 * @private
 * @internal
 */
const COMMAND_PATTERN = /^([^+().][^().]*)\.(m|c)?(j|t)sx?$/;

/**
 * @private
 * @internal
 */
const CATEGORY_PATTERN = /^\(.+\)$/;

/**
 * Handles discovery and parsing of command and middleware files in the filesystem.
 */
export class CommandsRouter {
  /**
   * @private
   * @internal
   */
  private commands = new Collection<string, Command>();

  /**
   * @private
   * @internal
   */
  private middlewares = new Collection<string, Middleware>();

  /**
   * Creates a new CommandsRouter instance.
   * @param options - Configuration options for the router
   */
  public constructor(private readonly options: CommandsRouterOptions) {}

  /**
   * Populates the router with existing command and middleware data.
   * @param data - Parsed command data to populate with
   */
  public populate(data: ParsedCommandData) {
    for (const [id, command] of Object.entries(data.commands)) {
      this.commands.set(id, command);
    }

    for (const [id, middleware] of Object.entries(data.middlewares)) {
      this.middlewares.set(id, middleware);
    }
  }

  /**
   * Checks if the configured entrypoint path exists.
   * @returns True if the path exists
   */
  public isValidPath(): boolean {
    return existsSync(this.options.entrypoint);
  }

  /**
   * @private
   * @internal
   */
  private isCommand(name: string): boolean {
    return COMMAND_PATTERN.test(name);
  }

  /**
   * @private
   * @internal
   */
  private isMiddleware(name: string): boolean {
    return (
      MIDDLEWARE_PATTERN.test(name) ||
      GLOBAL_MIDDLEWARE_PATTERN.test(name) ||
      COMMAND_MIDDLEWARE_PATTERN.test(name)
    );
  }

  /**
   * @private
   * @internal
   */
  private isCategory(name: string): boolean {
    return CATEGORY_PATTERN.test(name);
  }

  /**
   * Clears all loaded commands and middleware.
   */
  public clear() {
    this.commands.clear();
    this.middlewares.clear();
  }

  /**
   * Scans the filesystem for commands and middleware files.
   * @returns Parsed command data
   */
  public async scan() {
    const entries = await readdir(this.options.entrypoint, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      // ignore _ prefixed files
      if (entry.name.startsWith('_')) continue;

      const fullPath = join(this.options.entrypoint, entry.name);

      if (entry.isDirectory()) {
        const category = this.isCategory(entry.name)
          ? entry.name.slice(1, -1)
          : null;

        await this.traverse(fullPath, category);
      } else {
        await this.handle(entry);
      }
    }

    await this.applyMiddlewares();

    return this.toJSON();
  }

  /**
   * Gets the raw command and middleware collections.
   * @returns Object containing commands and middlewares collections
   */
  public getData() {
    return {
      commands: this.commands,
      middlewares: this.middlewares,
    };
  }

  /**
   * Converts the loaded data to a JSON-serializable format.
   * @returns Plain object with commands and middlewares
   */
  public toJSON() {
    return {
      commands: Object.fromEntries(this.commands.entries()),
      middlewares: Object.fromEntries(this.middlewares.entries()),
    };
  }

  /**
   * @private
   * @internal
   */
  private async traverse(path: string, category: string | null) {
    const entries = await readdir(path, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      // ignore _ prefixed files
      if (entry.name.startsWith('_')) continue;

      if (entry.isFile()) {
        if (this.isCommand(entry.name) || this.isMiddleware(entry.name)) {
          await this.handle(entry, category);
        }
      } else if (
        entry.isDirectory() &&
        this.isCategory(entry.name) &&
        category
      ) {
        // nested category
        const nestedCategory = this.isCategory(entry.name)
          ? `${category}:${entry.name.slice(1, -1)}`
          : null;
        await this.traverse(join(path, entry.name), nestedCategory);
      }

      // TODO: handle subcommands
    }
  }

  /**
   * @private
   * @internal
   */
  private async handle(entry: Dirent, category: string | null = null) {
    const name = entry.name;
    const path = join(entry.parentPath, entry.name);

    if (this.isCommand(name)) {
      const command: Command = {
        id: crypto.randomUUID(),
        name: basename(path, extname(path)),
        path,
        category,
        parentPath: entry.parentPath,
        relativePath: this.replaceEntrypoint(path),
        middlewares: [],
      };

      this.commands.set(command.id, command);
    } else if (this.isMiddleware(name)) {
      const middleware: Middleware = {
        id: crypto.randomUUID(),
        name: basename(path, extname(path)),
        path,
        relativePath: this.replaceEntrypoint(path),
        parentPath: entry.parentPath,
        global: GLOBAL_MIDDLEWARE_PATTERN.test(name),
        command: COMMAND_MIDDLEWARE_PATTERN.test(name)
          ? name.match(COMMAND_MIDDLEWARE_PATTERN)?.[1] || null
          : null,
      };

      this.middlewares.set(middleware.id, middleware);
    }
  }

  /**
   * @private
   * @internal
   */
  private applyMiddlewares() {
    this.commands.forEach((command) => {
      const commandPath = command.parentPath;
      const samePathMiddlewares = Array.from(this.middlewares.values())
        .filter((middleware) => {
          if (middleware.global) return true;
          if (middleware.command) return middleware.command === command.name;
          return middleware.parentPath === commandPath;
        })
        .map((middleware) => middleware.id);

      command.middlewares = Array.from(
        new Set([...command.middlewares, ...samePathMiddlewares]),
      );
    });
  }

  /**
   * @private
   * @internal
   */
  private replaceEntrypoint(path: string) {
    const normalized = normalize(path);
    return normalized.replace(this.options.entrypoint, '');
  }
}
