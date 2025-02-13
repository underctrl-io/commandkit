import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Configuration options for the EventsRouter
 * @interface EventsRouterOptions
 */
export interface EventsRouterOptions {
  /** Root directory path where event handlers are located */
  entrypoint: string;
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
}

/** Map of event names to their parsed metadata */
export type EventsTree = Record<string, ParsedEvent>;

/**
 * Router for discovering and managing event handler files in a directory structure.
 * Events are represented by directories, and handlers are files within those directories.
 */
export class EventsRouter {
  /** Internal storage of parsed events */
  private events = new Map<string, ParsedEvent>();

  /**
   * Creates a new EventsRouter instance
   * @param options - Configuration options for the router
   * @throws Error if entrypoint is not provided
   */
  public constructor(private options: EventsRouterOptions) {
    if (!options.entrypoint) {
      throw new Error('Entrypoint directory must be provided');
    }
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
  public get entrypoint(): string {
    return this.options.entrypoint;
  }

  /**
   * Checks if the entrypoint path is valid
   */
  public isValidPath() {
    return existsSync(this.entrypoint);
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
    const dirs = await readdir(this.entrypoint, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const path = join(this.entrypoint, dir.name);
        const event = await this.scanEvent(dir.name, path);
        this.events.set(event.event, event);
      }
    }

    return Object.fromEntries(this.events);
  }

  /**
   * Convert the internal events map to a plain object
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
    listeners: string[] = [],
  ): Promise<ParsedEvent> {
    const files = await readdir(path, { withFileTypes: true });

    for (const file of files) {
      if (/node_modules/.test(file.name)) continue;

      if (file.isDirectory()) {
        const nextPath = join(path, file.name);
        await this.scanEvent(event, nextPath, listeners);
        continue;
      }

      if (file.isFile() && /\.(m|c)?(j|t)sx?$/.test(file.name)) {
        listeners.push(join(file.parentPath, file.name));
      }
    }

    return { event, path, listeners };
  }
}
