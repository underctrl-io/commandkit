import { Collection } from 'discord.js';
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface ParsedCommand {
  /**
   * The unique identifier of this command.
   */
  id: string;
  /**
   * The file name without the extension.
   */
  name: string;
  /**
   * The full path to the command file.
   * This can be null for directories that function as command groups but have no index file.
   */
  path: string | null;
  /**
   * The category of the command.
   */
  category: string | null;
  /**
   * The subcommands of this command parsed from `(category)` format, but omitting the brackets.
   */
  subcommands: string[];
  /**
   * The middlewares of this command.
   */
  middlewares: string[];
}

export interface ParsedSubCommand {
  /**
   * The unique identifier of this subcommand.
   */
  id: string;
  /**
   * The file name without the extension.
   */
  name: string;
  /**
   * The full path to the subcommand file.
   */
  path: string;
  /**
   * The category of the subcommand parsed from `(category)` format, but omitting the brackets.
   */
  category: string | null;
  /**
   * The subcommand group name for this subcommand.
   */
  group: string | null;
  /**
   * The middlewares of this subcommand.
   */
  middlewares: string[];
}

export interface ParsedMiddleware {
  /**
   * The file name without the extension.
   */
  name: string;
  /**
   * The unique identifier of this middleware.
   */
  id: string;
  /**
   * The full path to this middleware file.
   */
  path: string;
  /**
   * The category of this middleware.
   */
  category: string | null;
}

export interface CommandsTree {
  /**
   * The record of commands mapped by their unique identifiers.
   */
  commands: Record<string, ParsedCommand>;
  /**
   * The record of subcommands mapped by their unique identifiers.
   */
  subcommands: Record<string, ParsedSubCommand>;
  /**
   * The record of middlewares mapped by their unique identifiers.
   */
  middlewares: Record<string, ParsedMiddleware>;
}

export interface ParsedCommandsData {
  /**
   * The collection of parsed commands.
   */
  commands: Collection<string, ParsedCommand>;
  /**
   * The collection of parsed subcommands.
   */
  subcommands: Collection<string, ParsedSubCommand>;
  /**
   * The collection of parsed middlewares.
   */
  middlewares: Collection<string, ParsedMiddleware>;
}

export interface CommandsRouterOptions {
  /**
   * The entrypoint directory to scan for commands.
   */
  entrypoint: string;
}

export class CommandsRouter {
  private commands: Collection<string, ParsedCommand> = new Collection();
  private subcommands: Collection<string, ParsedSubCommand> = new Collection();
  private middlewares: Collection<string, ParsedMiddleware> = new Collection();

  public constructor(private readonly options: CommandsRouterOptions) {}

  public get entrypoint() {
    return this.options.entrypoint;
  }

  public isValidPath() {
    return existsSync(this.entrypoint);
  }

  public getData(): ParsedCommandsData {
    return {
      commands: this.commands,
      subcommands: this.subcommands,
      middlewares: this.middlewares,
    };
  }

  public toJSON(): CommandsTree {
    return {
      commands: Object.fromEntries(this.commands.entries()),
      subcommands: Object.fromEntries(this.subcommands.entries()),
      middlewares: Object.fromEntries(this.middlewares.entries()),
    };
  }

  public clear(): void {
    this.commands.clear();
    this.subcommands.clear();
    this.middlewares.clear();
  }

  public async reload(): Promise<CommandsTree> {
    this.clear();
    return this.scan();
  }

  public async scan() {
    await this.scanDirectory(this.entrypoint);
    return this.toJSON();
  }

  private async scanDirectory(
    dir: string,
    parentPath = '',
    categories: string[] = [],
  ) {
    const entries = await readdir(dir);
    const directoryStats = new Map<string, boolean>();

    // First, gather information about which entries are directories
    for (const entry of entries) {
      if (entry.startsWith('_')) continue; // Ignore files/folders starting with _
      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      directoryStats.set(entry, stats.isDirectory());
    }

    // Process middlewares first so they can be associated with commands
    await this.processMiddlewares(dir, entries, parentPath, categories);

    // Process commands and subdirectories
    for (const entry of entries) {
      if (entry.startsWith('_')) continue; // Ignore files/folders starting with _

      // Skip middleware files as they're already processed
      if (entry.includes('.middleware.')) continue;

      const fullPath = path.join(dir, entry);
      const isDirectory = directoryStats.get(entry) || false;

      if (isDirectory) {
        // Extract name and categories from directory name
        const { name, parsedCategories } = this.parseNameAndCategory(entry);
        const newCategories = [...categories, ...parsedCategories];

        // Skip directory as a command node if it's just a category container
        const isCategoryContainer = /^\([^)]+\)$/.test(entry);

        if (isCategoryContainer) {
          // If it's just a category container, scan the contents without creating a command
          await this.scanDirectory(fullPath, parentPath, newCategories);
        } else {
          // Otherwise, process it as a normal command directory
          const newParentPath = parentPath ? `${parentPath}/${name}` : name;

          // Always process directories as command groups regardless of index file
          // This allows /dir/file.js to be a subcommand of dir even without an index
          await this.processCommandDirectory(
            fullPath,
            name,
            newParentPath,
            newCategories,
          );
        }
      } else {
        // This is a file
        // Check file extension using regex pattern for valid JavaScript/TypeScript files
        if (!/\.(m|c)?(j|t)sx?$/.test(entry)) {
          continue; // Skip files that don't match our valid extensions
        }

        const extname = path.extname(entry);
        const basename = path.basename(entry, extname);

        if (basename === 'index') {
          // Skip index files when processing directly - they're handled when processing directories
          continue;
        }

        // Process as a command file
        const { name, parsedCategories } = this.parseNameAndCategory(basename);
        const newCategories = [...categories, ...parsedCategories];

        if (parentPath) {
          // This is potentially a subcommand
          await this.processSubCommand(
            fullPath,
            name,
            parentPath,
            newCategories,
          );
        } else {
          // This is a top-level command
          await this.processCommand(fullPath, name, newCategories);
        }
      }
    }
  }

  private async processMiddlewares(
    dir: string,
    entries: string[],
    parentPath: string,
    categories: string[],
  ) {
    for (const entry of entries) {
      if (entry.startsWith('_')) continue;
      if (!entry.includes('.middleware.')) continue;

      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) continue;

      // Check file extension using regex pattern for valid JavaScript/TypeScript files
      if (!/\.(m|c)?(j|t)sx?$/.test(entry)) {
        continue; // Skip files that don't match our valid extensions
      }

      const extname = path.extname(entry);
      const basename = path.basename(entry, extname);
      const middlewareSegments = basename.split('.middleware');
      const middlewareName = middlewareSegments[0];

      const { name, parsedCategories } =
        this.parseNameAndCategory(middlewareName);
      const newCategories = [...categories, ...parsedCategories];
      const category = newCategories.length ? newCategories.join(':') : null;

      // Create middleware object with unique ID using crypto.randomUUID
      const middleware: ParsedMiddleware = {
        name,
        id: randomUUID(), // Using randomUUID for unique ID generation
        path: fullPath,
        category,
      };

      this.middlewares.set(middleware.id, middleware);
    }
  }

  private async processCommand(
    filePath: string,
    name: string,
    categories: string[],
  ) {
    const category = categories.length ? categories.join(':') : null;
    const id = randomUUID(); // Using randomUUID for unique ID generation

    // Find associated middlewares
    const middlewares = this.findAssociatedMiddlewares(name, category);

    const command: ParsedCommand = {
      id,
      name,
      path: filePath,
      category,
      subcommands: [],
      middlewares,
    };

    this.commands.set(id, command);
  }

  private async processCommandDirectory(
    dirPath: string,
    name: string,
    parentPath: string,
    categories: string[],
  ) {
    const category = categories.length ? categories.join(':') : null;
    const id = randomUUID(); // Using randomUUID for unique ID generation

    // Find index file by checking multiple possible extensions
    let indexFile: string | null = null;
    const possibleExtensions = [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.mjs',
      '.cjs',
      '.mts',
      '.cts',
    ];
    for (const ext of possibleExtensions) {
      const testPath = path.join(dirPath, `index${ext}`);
      if (existsSync(testPath)) {
        indexFile = testPath;
        break;
      }
    }

    // Find associated middlewares
    const middlewares = this.findAssociatedMiddlewares(name, category);

    // Find potential subcommands in this directory
    const entries = await readdir(dirPath);
    const subcommands: string[] = [];

    for (const entry of entries) {
      if (entry.startsWith('_') || entry.startsWith('index.')) continue;

      const fullPath = path.join(dirPath, entry);
      const stats = await stat(fullPath);
      const isDirectory = stats.isDirectory();

      // Check file extension using regex pattern for valid JavaScript/TypeScript files
      if (!isDirectory && !/\.(m|c)?(j|t)sx?$/.test(entry)) {
        continue; // Skip files that don't match our valid extensions
      }

      if (!isDirectory || (isDirectory && !entry.includes('.'))) {
        const extname = isDirectory ? '' : path.extname(entry);
        const baseName = isDirectory ? entry : path.basename(entry, extname);
        if (!baseName.includes('.middleware')) {
          const { name: subName } = this.parseNameAndCategory(baseName);
          subcommands.push(subName);
        }
      }
    }

    // Create command representation for this directory even if no index file exists
    const command: ParsedCommand = {
      id,
      name,
      path: indexFile, // This can be null if no index file exists
      category,
      subcommands,
      middlewares,
    };

    this.commands.set(id, command);

    // Scan for actual subcommands
    await this.scanDirectory(dirPath, id, categories);
  }

  private async processSubCommand(
    filePath: string,
    name: string,
    parentPath: string,
    categories: string[],
  ) {
    // Validate file extension
    if (!/\.(m|c)?(j|t)sx?$/.test(filePath)) {
      return; // Skip files that don't match our valid extensions
    }

    const pathSegments = parentPath.split('/');
    let group: string | null = null;

    // Check if this is a subcommand inside a group (depth > 1)
    // parentPath format could be: "commandId" or "commandId/groupName"
    if (pathSegments.length > 1) {
      // The second segment is the subcommand group if it exists
      group = pathSegments[1];
    }

    const category = categories.length ? categories.join(':') : null;
    const id = randomUUID(); // Using randomUUID for unique ID generation

    // Find associated middlewares
    const middlewares = this.findAssociatedMiddlewares(name, category);

    const subcommand: ParsedSubCommand = {
      id,
      name,
      path: filePath,
      category,
      group,
      middlewares,
    };

    this.subcommands.set(id, subcommand);
  }

  private parseNameAndCategory(name: string): {
    name: string;
    parsedCategories: string[];
  } {
    const parsedCategories: string[] = [];

    // Extract categories in format (category)
    const regex = /\(([^)]+)\)/g;
    let match;
    let cleanName = name;

    while ((match = regex.exec(name)) !== null) {
      parsedCategories.push(match[1]);
      cleanName = cleanName.replace(match[0], '');
    }

    return {
      name: cleanName.trim(),
      parsedCategories,
    };
  }

  private findAssociatedMiddlewares(
    commandName: string,
    category: string | null,
  ): string[] {
    const middlewares: string[] = [];

    this.middlewares.forEach((middleware) => {
      // Global middleware (named just 'middleware')
      if (middleware.name === 'middleware') {
        middlewares.push(middleware.id);
        return;
      }

      // Command-specific middleware
      if (middleware.name === commandName) {
        middlewares.push(middleware.id);
        return;
      }

      // Category-based middleware matching
      if (category && middleware.category === category) {
        middlewares.push(middleware.id);
      }
    });

    return middlewares;
  }
}
