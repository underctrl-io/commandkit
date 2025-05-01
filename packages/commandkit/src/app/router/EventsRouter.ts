import { Collection } from 'discord.js';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Configuration options for the EventsRouter
 * @interface EventsRouterOptions
 */
export interface EventsRouterOptions {
  /** Root directory path where event handlers are located */
  entrypoints: string[];
}

/**
 * Represents a parsed event with its handlers
 * @interface ParsedEvent
 */
export interface ParsedEvent {
  /** Name of the event derived from directory name */
  event: string;
  /** Absolute path to the event directory */
  path: string;
  /** Array of file paths to event listener handlers */
  listeners: string[];
  /** Namespace of the event */
  namespace: string | null;
}

/** Collection of event names to their parsed metadata */
export type EventsTree = Record<string, ParsedEvent>;

/**
 * Router for discovering and managing event handler files in a directory structure.
 * Events are represented by directories, and handlers are files within those directories.
 */
export class EventsRouter {
  /** Internal storage of parsed events */
  private events = new Collection<string, ParsedEvent>();

  /**
   * Creates a new EventsRouter instance
   * @param options - Configuration options for the router
   * @throws Error if entrypoint is not provided
   */
  public constructor(private options: EventsRouterOptions) {
    if (options.entrypoints) {
      options.entrypoints = Array.from(new Set(options.entrypoints));
    }

    if (!options.entrypoints?.length) {
      throw new Error('Entrypoint directory must be provided');
    }
  }

  /**
   * Adds new entrypoints to the router
   * @param entrypoints - Array of new entrypoint paths
   */
  public addEntrypoints(entrypoints: string[]) {
    this.options.entrypoints = Array.from(
      new Set([...this.options.entrypoints, ...entrypoints]),
    );
  }

  /**
   * Find a parsed event by its name
   * @param event - Name of the event to find
   * @returns Parsed event metadata or null if not found
   */
  public match(event: string): ParsedEvent | null {
    return this.events.get(event) ?? null;
  }

  /**
   * Get the entrypoint directory path
   * @returns Entrypoint directory path
   */
  public get entrypoints(): string[] {
    return this.options.entrypoints;
  }

  /**
   * Checks if the entrypoint path is valid
   */
  public isValidPath() {
    return this.entrypoints.every((entrypoint) => existsSync(entrypoint));
  }

  /**
   * Clear all parsed events
   */
  public clear() {
    this.events.clear();
  }

  /**
   * Reload and re-scan the entrypoint directory for events
   * @returns Promise resolving to the updated events tree
   */
  public async reload() {
    this.clear();
    return this.scan();
  }

  /**
   * Scan the entrypoint directory for events and their handlers
   * @returns Promise resolving to the events tree
   */
  public async scan(): Promise<EventsTree> {
    for (const entrypoint of this.entrypoints) {
      const dirs = await readdir(entrypoint, { withFileTypes: true });

      for (const dir of dirs) {
        if (dir.isDirectory()) {
          const path = join(entrypoint, dir.name);
          await this.scanEvent(dir.name, path, null, [], true);
        }
      }
    }

    return Object.fromEntries(this.events);
  }

  /**
   * Convert the internal events Collection to a plain object
   * @returns Events tree as a plain object
   */
  public toJSON(): EventsTree {
    return Object.fromEntries(this.events);
  }

  /**
   * Recursively scan a directory for event handlers
   * @param event - Name of the event
   * @param path - Path to the event directory
   * @param listeners - Array to collect listener file paths
   * @returns Promise resolving to the parsed event metadata
   */
  private async scanEvent(
    event: string,
    path: string,
    _namespace: string | null = null,
    listeners: string[] = [],
    isRoot = false,
  ): Promise<void> {
    const files = await readdir(path, { withFileTypes: true });
    const isNamespace = isRoot && /^\(.+\)$/.test(event);

    // if event = (something) pattern then namespace is something
    const namespace = isNamespace ? event.slice(1, -1) : (_namespace ?? null);

    for (const file of files) {
      if (file.name.startsWith('_')) continue;

      if (file.isDirectory()) {
        const nextPath = join(path, file.name);
        await this.scanEvent(file.name, nextPath, namespace, listeners);
        continue;
      }

      if (file.isFile() && /\.(m|c)?(j|t)sx?$/.test(file.name)) {
        listeners.push(join(file.parentPath, file.name));
      }
    }

    if (!isNamespace) {
      this.events.set(event, { event, path, listeners, namespace });
    }
  }
}
