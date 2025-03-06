import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path, { join } from 'node:path';

/**
 * Matcher type for identifying command and middleware files.
 * Can be a string suffix (e.g. '.cmd.js'), RegExp pattern, or custom matcher function.
 */
export type CommandsRouterMatcher =
  | string
  | RegExp
  | ((path: string) => boolean);

/**
 * Maps file type identifiers to their respective matchers.
 * Used to identify command and middleware files in the directory structure.
 */
export type CommandsRouterMatchersMap = Record<
  'command' | 'middleware',
  CommandsRouterMatcher
>;

/**
 * Configuration options for the CommandsRouter
 */
export interface CommandsRouterOptions {
  /**
   * The path to the directory containing the command files.
   */
  entrypoint: string;
  /**
   * The path to the directory containing the middleware files.
   */
  matcher?: Partial<CommandsRouterMatchersMap>;
}

/**
 * Represents a parsed command with its metadata
 * @interface ParsedCommand
 */
export interface ParsedCommand {
  /** Command name derived from the file name without extension */
  name: string;
  /** Absolute file system path to the command file */
  path: string;
  /** Parent command name for nested commands, or null if root-level command */
  parent: string | null;
  /** Array of command segments representing the command hierarchy */
  parentSegments: string[];
  /** Array of middleware IDs that apply to this command */
  middlewares: string[];
  /** Absolute path to this command */
  fullPath: string;
  /** Category the command belongs to, if any */
  category: string | null;
}

/**
 * Represents a parsed middleware with its metadata
 * @interface ParsedMiddleware
 */
export interface ParsedMiddleware {
  /** Unique identifier used to reference this middleware */
  id: string;
  /** Middleware name derived from the file path */
  name: string;
  /** Path to the middleware file, relative to the entrypoint */
  path: string;
  /** Absolute path to the middleware file */
  fullPath: string;
  /** Category the middleware belongs to, if any */
  category: string | null;
}

/**
 * Complete tree structure of all commands and middleware
 * @interface CommandsTree
 */
export interface CommandsTree {
  /** Map of command names to their parsed metadata */
  commands: Record<string, ParsedCommand>;
  /** Map of middleware IDs to their parsed metadata */
  middleware: Record<string, ParsedMiddleware>;
}

/**
 * Result of a successful command match operation
 * @interface CommandMatchResult
 */
export interface CommandMatchResult {
  /** The matched command metadata */
  command: ParsedCommand;
  /** Array of middleware that apply to the matched command */
  middlewares: ParsedMiddleware[];
}

/**
 * CommandsRouter handles the discovery and routing of commands and middleware files
 * in a directory structure. It supports nested commands and middleware inheritance.
 */
export class CommandsRouter {
  private commands = new Map<string, ParsedCommand>();
  private middlewares = new Map<string, ParsedMiddleware>();

  /**
   * Creates a new CommandsRouter instance
   * @param options - Configuration options for the router
   */
  public constructor(private readonly options: CommandsRouterOptions) {
    if (!options.entrypoint) {
      throw new Error('Entrypoint directory must be provided');
    }

    options.matcher ??= {};
    options.matcher.command ??= /command\.(m|c)?(j|t)sx?$/;
    options.matcher.middleware ??= /middleware\.(m|c)?(j|t)sx?$/;
  }

  /**
   * Gets the configured entrypoint directory
   */
  public get entrypoint(): string {
    return this.options.entrypoint;
  }

  /**
   * Gets the configured matchers for command and middleware files
   */
  public get matchers(): CommandsRouterMatchersMap {
    return this.options.matcher as CommandsRouterMatchersMap;
  }

  /**
   * Returns the cached data of the commands and middleware
   */
  public getData() {
    return {
      commands: this.commands,
      middleware: this.middlewares,
    };
  }

  /**
   * Checks if the entrypoint path is valid
   */
  public isValidPath() {
    return existsSync(this.entrypoint);
  }

  /**
   * Executes a matcher against a file path
   * @param matcher - The matcher to use
   * @param path - The file path to test
   * @returns boolean indicating if the path matches
   */
  private execMatcher(matcher: CommandsRouterMatcher, path: string): boolean {
    if (typeof matcher === 'string') {
      return path.endsWith(matcher);
    }

    if (matcher instanceof RegExp) {
      return matcher.test(path);
    }

    return matcher(path);
  }

  /**
   * Converts an absolute path to a path relative to the entrypoint
   * @param path - The absolute path to convert
   */
  private resolveRelativePath(path: string): string {
    const regex = new RegExp(`^${this.entrypoint}`);
    return path.replace(regex, '');
  }

  /**
   * Matches a command by name or path segments
   * @param commandOrSegment - Command name or array of path segments
   * @returns Matched command and its middlewares, or null if no match
   */
  public match(commandOrSegment: string | string[]): CommandMatchResult | null {
    if (!commandOrSegment?.length) return null;

    if (Array.isArray(commandOrSegment) && commandOrSegment.length === 1) {
      commandOrSegment = commandOrSegment[0];
    }

    if (!Array.isArray(commandOrSegment) && !commandOrSegment.includes(' ')) {
      const command = this.commands.get(commandOrSegment);
      if (!command) return null;

      const middlewares = command.middlewares
        .map((id) => this.middlewares.get(id))
        .filter((m): m is ParsedMiddleware => !!m);

      return {
        command,
        middlewares,
      };
    }

    const segments = Array.isArray(commandOrSegment)
      ? commandOrSegment
      : commandOrSegment.split(' ');

    const command = Array.from(this.commands.values()).find((cmd) => {
      const commandSegments = cmd.parentSegments;

      if (commandSegments.length !== segments.length) return false;

      return commandSegments.every((segment, index) => {
        if (/^\[.+\]$/.test(segment)) return true;
        return segment === segments[index];
      });
    });

    if (!command) return null;

    const middlewares = command.middlewares
      .map((id) => this.middlewares.get(id))
      .filter((m): m is ParsedMiddleware => !!m);

    return {
      command,
      middlewares,
    };
  }

  /**
   * Reloads the commands tree by re-scanning the entrypoint directory
   */
  public async reload(): Promise<CommandsTree> {
    this.clear();
    return this.scan();
  }

  /**
   * Clears the internal commands and middleware maps
   */
  public clear(): void {
    this.commands.clear();
    this.middlewares.clear();
  }

  /**
   * Scans the entrypoint directory for commands and middleware
   * @returns Promise resolving to the complete commands tree
   */
  public async scan(): Promise<CommandsTree> {
    this.clear();
    const files = await this.scanDirectory(this.entrypoint, []);

    // First pass: collect all files
    const commandFiles = files.filter((file) => {
      const basename = path.basename(file);
      return !this.isIgnoredFile(basename) && this.isCommandFile(file);
    });

    // Second pass: process middleware
    const middlewareFiles = files.filter((file) =>
      this.execMatcher(this.matchers.middleware, file),
    );

    // Process commands
    for (const file of commandFiles) {
      const parsedPath = this.parseCommandPath(file);
      const location = this.resolveRelativePath(file);

      const command: ParsedCommand = {
        name: parsedPath.name,
        path: location,
        fullPath: file,
        parent: parsedPath.parent,
        parentSegments: parsedPath.parentSegments,
        category: parsedPath.category,
        middlewares: [],
      };

      this.commands.set(parsedPath.name, command);
    }

    // Process middleware
    for (const file of middlewareFiles) {
      const location = this.resolveRelativePath(file);
      const dirname = path.dirname(location);
      const id = crypto.randomUUID();
      const parts = location.split(path.sep).filter((p) => p);
      const categories = this.parseCategories(parts);

      const middleware: ParsedMiddleware = {
        id,
        name: dirname,
        path: location,
        fullPath: file,
        category: categories.length ? categories.join('/') : null,
      };

      this.middlewares.set(id, middleware);

      // Apply middleware based on location
      const isGlobalMiddleware = path.parse(file).name === 'middleware';
      const commands = Array.from(this.commands.values());

      for (const command of commands) {
        const commandDir = path.dirname(command.path);

        if (isGlobalMiddleware) {
          // Global middleware applies if command is in same dir or nested
          if (
            commandDir === dirname ||
            commandDir.startsWith(dirname + path.sep)
          ) {
            command.middlewares.push(id);
          }
        } else {
          // Specific middleware only applies to exact command match
          const commandName = command.name;
          const middlewareName = path
            .basename(file)
            .replace(/\.middleware\.(m|c)?(j|t)sx?$/, '');
          if (commandName === middlewareName && commandDir === dirname) {
            command.middlewares.push(id);
          }
        }
      }
    }

    return this.toJSON();
  }

  /**
   * Converts the internal maps to a serializable object
   * @returns CommandsTree containing all commands and middleware
   */
  public toJSON(): CommandsTree {
    return {
      commands: Object.fromEntries(this.commands),
      middleware: Object.fromEntries(this.middlewares),
    };
  }

  /**
   * Recursively scans a directory for files
   * @param dir - Directory to scan
   * @param entries - Accumulator for found files
   * @returns Promise resolving to array of file paths
   */
  private async scanDirectory(
    dir: string,
    entries: string[],
  ): Promise<string[]> {
    const files = await readdir(dir, {
      withFileTypes: true,
    });

    for (const file of files) {
      // for whatever reason
      if (
        file.name === 'node_modules' ||
        file.parentPath.includes('node_modules')
      ) {
        continue;
      }

      if (file.isDirectory()) {
        const next = join(dir, file.name);
        await this.scanDirectory(next, entries);
        continue;
      }

      entries.push(join(dir, file.name));
    }

    return entries;
  }

  private isIgnoredFile(filename: string): boolean {
    return filename.startsWith('_');
  }

  private isCommandFile(path: string): boolean {
    if (this.execMatcher(this.matchers.middleware, path)) return false;
    return (
      /index\.(m|c)?(j|t)sx?$/.test(path) || /\.(m|c)?(j|t)sx?$/.test(path)
    );
  }

  private parseCategories(parts: string[]): string[] {
    return parts
      .filter((part) => part.startsWith('(') && part.endsWith(')'))
      .map((part) => part.slice(1, -1));
  }

  private parseCommandPath(filepath: string): {
    name: string;
    category: string | null;
    parent: string | null;
    parentSegments: string[];
  } {
    const location = this.resolveRelativePath(filepath);
    const parts = location.split(path.sep).filter((p) => p);
    const categories = this.parseCategories(parts);
    const segments: string[] = parts.filter(
      (part) => !(part.startsWith('(') && part.endsWith(')')),
    );

    let name = segments.pop() || '';
    name = name.replace(/\.(m|c)?(j|t)sx?$/, '').replace(/^index$/, '');

    return {
      name,
      category: categories.length ? categories.join('/') : null,
      parent: segments.length ? segments.join(' ') : null,
      parentSegments: segments,
    };
  }
}
