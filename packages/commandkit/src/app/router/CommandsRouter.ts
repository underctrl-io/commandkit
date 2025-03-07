import { Collection } from 'discord.js';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path/posix';

/**
 * Represents a command file info parsed from the file system.
 * It does not contain any command specific data, as that's loaded later by the command handler.
 */
export interface ParsedCommand {
  /**
   * The unique identifier of the command. This is used to distinguish between commands that may have the same name.
   */
  id: string;
  /**
   * The file name of the command.
   */
  name: string;
  /**
   * The absolute path to the command file.
   */
  path: string;
  /**
   * The relative path from the cwd to the command file.
   */
  relativePath: string;
  /**
   * The category of this command. This will be the parent directory segment that matches /(category)/ in the path.
   * When there are multiple segments, they are combined with a colon.
   * Example: `/commands/(games)/tictactoe.js` -> category is `games`
   * Example: `/commands/(games)/(fun)/tictactoe.js` -> category is `games:fun`
   * Category is `null` if the parent directory segment does not match `/(\w+)/`.
   */
  category: string | null;
  /**
   * Array of ids referencing the associated middleware for this command.
   */
  middlewares: string[];
  /**
   * Array of ids referencing the associated subcommands for this command.
   */
  subcommands: string[];
}

/**
 * Represents a middleware file info parsed from the file system.
 */
export interface ParsedMiddleware {
  /**
   * The unique identifier of the middleware. This is used to distinguish between middlewares that may have the same name.
   */
  id: string;
  /**
   * The file name of the middleware.
   */
  name: string;
  /**
   * The absolute path to the middleware file.
   */
  path: string;
  /**
   * The relative path from the cwd to the middleware file.
   */
  relativePath: string;
  /**
   * The category of this middleware. This will be the parent directory segment that matches /(category)/ in the path.
   */
  category: string | null;
}

/**
 * Represents a subcommand file info parsed from the file system.
 */
export interface ParsedSubCommand {
  /**
   * The unique identifier of the subcommand. This is used to distinguish between subcommands that may have the same name.
   */
  id: string;
  /**
   * The name of the subcommand.
   */
  name: string;
  /**
   * The group name of the subcommand. This is used to group subcommands together in the Discord UI.
   */
  group: string | null;
  /**
   * The absolute path to the subcommand file.
   */
  path: string;
  /**
   * The relative path from the cwd to the subcommand file.
   */
  relativePath: string;
  /**
   * Array of ids referencing the associated middleware for this subcommand.
   */
  middlewares: string[];
}

/**
 * Represents a JSON compatible object that contains all the parsed commands, middlewares, and subcommands.
 */
export interface CommandTree {
  commands: Record<string, ParsedCommand>;
  middlewares: Record<string, ParsedMiddleware>;
  subcommands: Record<string, ParsedSubCommand>;
}

/**
 * Represents the scanned and parsed command files.
 */
export interface ParsedCommandData {
  commands: Collection<string, ParsedCommand>;
  middlewares: Collection<string, ParsedMiddleware>;
  subcommands: Collection<string, ParsedSubCommand>;
}

export interface CommandsRouterOptions {
  /**
   * The path to the directory containing the command files.
   */
  entrypoint: string;
}

export class CommandsRouter {
  private commands = new Collection<string, ParsedCommand>();
  private middlewares = new Collection<string, ParsedMiddleware>();
  private subcommands = new Collection<string, ParsedSubCommand>();

  public constructor(private options: CommandsRouterOptions) {}

  public isValidPath() {
    return existsSync(this.entrypoint);
  }

  public get entrypoint() {
    return this.options.entrypoint;
  }

  public clear() {
    this.commands.clear();
    this.middlewares.clear();
    this.subcommands.clear();
  }

  public async reload() {
    this.clear();
    return this.scan();
  }

  public visualize(): string {
    let output = '';
    const commands = [...this.commands.values()];

    commands.forEach((command, index) => {
      const isLast = index === commands.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const childPrefix = isLast ? '  ' : '│ ';

      // Add command with category if available
      const categoryPrefix = command.category ? `[${command.category}] ` : '';
      output += `${prefix} ${categoryPrefix}${command.name}\n`;

      // Group subcommands by their group
      const subcommands = command.subcommands
        .map((id) => this.subcommands.get(id))
        .filter(Boolean) as ParsedSubCommand[];

      const groupedSubs = new Map<string | null, ParsedSubCommand[]>();

      subcommands.forEach((sub) => {
        if (!groupedSubs.has(sub.group)) {
          groupedSubs.set(sub.group, []);
        }
        groupedSubs.get(sub.group)!.push(sub);
      });

      // Process grouped subcommands
      const groups = [...groupedSubs.entries()];
      groups.forEach(([group, subs], groupIndex) => {
        const isLastGroup = groupIndex === groups.length - 1;

        if (group) {
          // If there's a group, display it
          const groupPrefix = isLastGroup
            ? `${childPrefix}└─`
            : `${childPrefix}├─`;
          output += `${groupPrefix} Group: ${group}\n`;
        }

        const subPrefix = group
          ? `${childPrefix}${isLastGroup ? '  ' : '│ '}`
          : childPrefix;

        subs.forEach((subcommand, subIndex) => {
          const isLastSub = subIndex === subs.length - 1;
          const subCommandPrefix = isLastSub
            ? `${subPrefix}└─`
            : `${subPrefix}├─`;

          output += `${subCommandPrefix} ${subcommand.name}\n`;

          // Add middlewares
          const middlewares = subcommand.middlewares
            .map((id) => this.middlewares.get(id))
            .filter(Boolean);

          middlewares.forEach((middleware, mwIndex) => {
            const isLastMw = mwIndex === middlewares.length - 1;
            const mwPrefix = isLastMw
              ? `${subPrefix}${isLastSub ? '  ' : '│ '}└─`
              : `${subPrefix}${isLastSub ? '  ' : '│ '}├─`;

            output += `${mwPrefix} ⚙️ ${middleware!.name}\n`;
          });
        });
      });

      // Add middlewares directly attached to command
      const commandMiddlewares = command.middlewares
        .map((id) => this.middlewares.get(id))
        .filter(Boolean);

      if (commandMiddlewares.length > 0) {
        output += `${childPrefix}└─ Middlewares:\n`;
        commandMiddlewares.forEach((middleware, mwIndex) => {
          const isLastMw = mwIndex === commandMiddlewares.length - 1;
          const mwPrefix = isLastMw
            ? `${childPrefix}  └─`
            : `${childPrefix}  ├─`;

          output += `${mwPrefix} ⚙️ ${middleware!.name}\n`;
        });
      }

      output += '\n';
    });

    return output;
  }

  public getData(): ParsedCommandData {
    return {
      commands: this.commands,
      middlewares: this.middlewares,
      subcommands: this.subcommands,
    };
  }

  public toJSON(): CommandTree {
    return {
      commands: Object.fromEntries(this.commands.entries()),
      middlewares: Object.fromEntries(this.middlewares.entries()),
      subcommands: Object.fromEntries(this.subcommands.entries()),
    };
  }

  public async scan(): Promise<CommandTree> {
    if (!this.isValidPath()) return this.toJSON();

    const root = this.entrypoint;

    await this.scanDeep(root);

    return this.toJSON();
  }

  private async scanDeep(entry: string, currentDepth = 2): Promise<void> {
    const normalizedPath = path.normalize(entry);
    const content = await readdir(normalizedPath, { withFileTypes: true });

    for (const item of content) {
      const itemPath = path.join(normalizedPath, item.name);

      if (this.shouldIgnore(itemPath, item.isDirectory())) continue;

      if (item.isDirectory()) {
        // Check if this is a category directory (has parentheses)
        const isCategoryDir = this.isCategoryDirectory(item.name);

        // Continue scanning directories if we haven't reached max depth
        // Don't decrease depth for category directories
        if (currentDepth > 0 || isCategoryDir) {
          // Only decrease depth if it's not a category directory
          const nextDepth = isCategoryDir ? currentDepth : currentDepth - 1;
          await this.scanDeep(itemPath, nextDepth);
        }
      } else {
        // Process file based on its type and depth
        const isInnerSubCommand = currentDepth === 0;
        const isSubCommandGroup = currentDepth === 1;
        const category = this.extractCategory(itemPath);
        const fileName = this.extractName(itemPath);
        const isIndexFile =
          fileName === 'index' && normalizedPath !== this.entrypoint;

        if (this.isMiddleware(itemPath)) {
          this.processMiddleware(itemPath, category);
        } else if (isInnerSubCommand || isSubCommandGroup) {
          this.processSubcommand(
            itemPath,
            path.basename(normalizedPath),
            isSubCommandGroup,
            isIndexFile,
          );
        } else {
          // At root level (currentDepth = 2), we have commands
          this.processCommand(
            itemPath,
            category,
            isIndexFile ? normalizedPath : null,
          );
        }
      }
    }
  }

  private processMiddleware(filePath: string, category: string | null): void {
    const middleware: ParsedMiddleware = {
      id: crypto.randomUUID(),
      name: this.getAppropriateFileName(filePath),
      path: filePath,
      relativePath: this.getRelativePath(filePath),
      category: category,
    };

    this.middlewares.set(middleware.id, middleware);
    this.applyMiddlewareToCommands(middleware);
  }

  private processSubcommand(
    filePath: string,
    parentDirName: string,
    isGrouped: boolean,
    isIndexFile: boolean = false,
  ): void {
    const subcommand: ParsedSubCommand = {
      id: crypto.randomUUID(),
      name: isIndexFile
        ? this.getDirectoryName(filePath)
        : this.extractName(filePath),
      group: isGrouped ? parentDirName : null,
      middlewares: [],
      path: filePath,
      relativePath: this.getRelativePath(filePath),
    };

    this.subcommands.set(subcommand.id, subcommand);
    this.applySubcommandToCommands(subcommand);
  }

  private processCommand(
    filePath: string,
    category: string | null,
    parentPath: string | null = null,
  ): void {
    const command: ParsedCommand = {
      id: crypto.randomUUID(),
      name: parentPath
        ? this.getDirectoryName(parentPath)
        : this.extractName(filePath),
      path: filePath,
      relativePath: this.getRelativePath(filePath),
      category: category,
      middlewares: [],
      subcommands: [],
    };

    this.commands.set(command.id, command);
  }

  /**
   * Gets the appropriate file name, handling index files specially
   * For index files, it returns the parent directory name (excluding category markers)
   */
  private getAppropriateFileName(filePath: string): string {
    const fileName = this.extractName(filePath);
    if (fileName === 'index' && path.dirname(filePath) !== this.entrypoint) {
      return this.getDirectoryName(filePath);
    }
    return fileName;
  }

  /**
   * Extract the clean directory name, removing any category markers
   */
  private getDirectoryName(filePath: string): string {
    const dirName = path.basename(path.dirname(filePath));
    // Remove category markers if present
    return dirName.replace(/^\((\w+)\)$/, '$1');
  }

  // Helper method to identify category directories
  private isCategoryDirectory(dirName: string): boolean {
    return /^\(\w+\)$/.test(dirName);
  }

  private applyMiddlewareToCommands(middleware: ParsedMiddleware) {
    for (const command of this.commands.values()) {
      // matching criteria: middleware file name is {commandFileNameWithoutExtension}.middleware.{extension}
      // or middleware file name is middleware.{extension}
      const middlewareFileName = path.basename(middleware.path);
      const match =
        middlewareFileName.startsWith(command.name) ||
        middlewareFileName === 'middleware';

      if (!match) continue;
      if (command.middlewares.includes(middleware.id)) continue;

      command.middlewares.push(middleware.id);
    }
  }

  private applySubcommandToCommands(subcommand: ParsedSubCommand) {
    for (const command of this.commands.values()) {
      // matching criteria: subcommand file's path contains the command file's path
      // but the path must be deeper than entrypoint
      if (!subcommand.path.startsWith(command.path)) continue;
      if (command.subcommands.includes(subcommand.id)) continue;

      command.subcommands.push(subcommand.id);
    }
  }

  private extractCategory(entry: string) {
    return entry
      .split(path.sep)
      .map((segment) => {
        const match = segment.match(/^\((\w+)\)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
      .join(':');
  }

  private getRelativePath(entry: string) {
    return path.relative(this.entrypoint, entry);
  }

  private isMiddleware(entry: string) {
    return (
      !this.shouldIgnore(entry) &&
      ['middleware', '.middleware.'].some((ext) => entry.includes(ext))
    );
  }

  private shouldIgnore(entry: string, dir = false) {
    const fileName = path.basename(entry);

    if (fileName.startsWith('_')) return true;
    if (!dir) return !/.(c|m)?(j|t)sx?$/.test(fileName);

    return false;
  }

  private extractName(entry: string) {
    return path.basename(entry).replace(/\.(c|m)?(j|t)sx?$/, '');
  }
}
