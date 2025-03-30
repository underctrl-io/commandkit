import { randomUUID } from 'node:crypto';
import { CommandKit } from '../CommandKit';
import { GenericFunction, getContext } from './async-context';

export interface CommandKitEnvironmentInternalData {
  executionError: Error | null;
  type: CommandKitEnvironmentType | null;
  variables: Map<string, any>;
  deferredFunctions: Map<string, GenericFunction<[CommandKitEnvironment]>>;
  marker: string;
  markStart: number;
  markEnd: number;
}

export class CommandKitEnvironment {
  #data: CommandKitEnvironmentInternalData = {
    executionError: null,
    type: null,
    variables: new Map(),
    deferredFunctions: new Map(),
    marker: '',
    markStart: 0,
    markEnd: 0,
  };

  /**
   * Creates the commandkit execution environment.
   * @param commandkit - The commandkit instance.
   */
  public constructor(public readonly commandkit: CommandKit) {}

  /**
   * Get the execution error.
   * @internal
   */
  public getExecutionError(): Error | null {
    return this.#data.executionError;
  }

  /**
   * Set the execution error.
   * @param error - The error to set.
   * @internal
   */
  public setExecutionError(error: Error): void {
    if (this.#data.executionError) {
      throw new Error('Execution error already set.');
    }

    this.#data.executionError = error;
  }

  /**
   * Get the environment type.
   */
  public getType(): CommandKitEnvironmentType {
    const type = this.#data.type;

    if (!type) {
      throw new Error('Environment type not set.');
    }

    return type;
  }

  /**
   * Set the environment type.
   * @param type - The environment type to set.
   * @internal
   */
  public setType(type: CommandKitEnvironmentType): void {
    this.#data.type = type;
  }

  /**
   * The variables store for this environment.
   */
  public get variables(): Map<string, any> {
    return this.#data.variables;
  }

  /**
   * Register a deferred function.
   * @param fn - The deferred function to register.
   * @returns The deferred function id.
   * @internal
   */
  public registerDeferredFunction(
    fn: GenericFunction<[CommandKitEnvironment]>,
  ): string {
    const id = randomUUID();
    this.#data.deferredFunctions.set(id, fn);
    return id;
  }

  /**
   * Clear a deferred function by id.
   * @param id - The deferred function id to clear.
   * @internal
   */
  public clearDeferredFunction(id: string): void {
    this.#data.deferredFunctions.delete(id);
  }

  /**
   * Run all deferred functions sequentially.
   * @internal
   */
  public async runDeferredFunctions(): Promise<void> {
    for (const [id, fn] of this.#data.deferredFunctions) {
      try {
        await fn(this);
      } catch (e) {
        this.commandkit.emit('unhandledDeferredFunctionRejection', e);
      } finally {
        this.clearDeferredFunction(id);
      }
    }
  }

  /**
   * Clear all deferred functions.
   * @internal
   */
  public clearAllDeferredFunctions(): void {
    this.#data.deferredFunctions.clear();
  }

  /**
   * Mark the start of a command execution.
   * @param marker - The marker to set.
   * @internal
   */
  public markStart(marker: string): void {
    this.#data.marker = marker;
    this.#data.markStart = performance.now();
  }

  /**
   * Mark the end of a command execution.
   * @internal
   */
  public markEnd(): void {
    if (!this.#data.markEnd) {
      this.#data.markEnd = performance.now();
    }
  }

  /**
   * Get the marker.
   * @internal
   */
  public getMarker(): string {
    return this.#data.marker;
  }

  /**
   * Get the execution time in milliseconds.
   * @internal
   */
  public getExecutionTime(): number {
    return Math.abs(this.#data.markEnd - this.#data.markStart);
  }
}

export enum CommandKitEnvironmentType {
  CommandHandler = 'COMMAND_HANDLER',
}

/**
 * Runs the given function after the current command has finished executing.
 * @param fn The function to run after the current command.
 * @returns The deferred function id. This can be used to cancel the deferred function.
 */
export function afterCommand(
  fn: GenericFunction<[CommandKitEnvironment]>,
): string {
  const env = getContext();

  if (!env) {
    throw new Error('after must be called inside commandkit handler.');
  }

  return env.registerDeferredFunction(fn);
}

/**
 * Cancels a deferred function registered with `afterCommand`.
 * @param id The deferred function id to cancel.
 */
export function cancelAfterCommand(id: string): void {
  const env = getContext();

  if (!env) {
    throw new Error('cancelAfter must be called inside commandkit handler.');
  }

  env.clearDeferredFunction(id);
}
