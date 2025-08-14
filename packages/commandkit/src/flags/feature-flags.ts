import { getCommandKit, getContext } from '../context/async-context';
import { eventWorkerContext } from '../app/events/EventWorkerContext';
import { ParsedEvent } from '../app/router';
import { CommandKit } from '../commandkit';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  ContextMenuCommandInteraction,
  Guild,
  Message,
  TextBasedChannel,
} from 'discord.js';
import { LoadedCommand } from '../app';
import { defer, JsonSerialize } from '../utils/utilities';
import { AnalyticsEvents } from '../analytics/constants';
import { FlagProvider, FlagConfiguration } from './FlagProvider';
import { Logger } from '../logger/Logger';

// Global flag provider
let flagProvider: FlagProvider | null = null;

/**
 * Set the global flag provider for all feature flags
 */
export function setFlagProvider(provider: FlagProvider): void {
  flagProvider = provider;
}

/**
 * @private
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Function type for identifying entities in the context of feature flags.
 * This function should return an object representing the entity that will be used
 * to evaluate the feature flag.
 * It can be synchronous or asynchronous.
 */
export type IdentifyFunction<R> = (
  context: EvaluationContext,
) => MaybePromise<R>;

/**
 * Function type for deciding the outcome of a feature flag based on the provided entities.
 * This function receives an object containing the entities and optionally the provider configuration,
 * and should return the result of the decision.
 * It can be synchronous or asynchronous.
 */
export type DecideFunction<E, R> = (data: {
  entities: E;
  provider?: FlagConfiguration | null;
}) => MaybePromise<R>;

/**
 * Definition for a feature flag, including its key, description, identify function,
 * and decide function.
 * The identify function is used to determine the entities that will be evaluated
 * against the feature flag, while the decide function contains the logic for
 * determining the outcome of the flag based on those entities.
 */
export interface FeatureFlagDefinition<R, Entity> {
  /**
   * Unique key for the feature flag.
   * Should be a string that identifies the flag.
   */
  key: string;
  /**
   * Optional description of the feature flag.
   * This can be used for documentation or debugging purposes.
   */
  description?: string;
  /**
   * Optional flag to enable integration with an external flag provider.
   * If true, the flag will use the global flag provider to determine its state.
   * Default: false
   */
  identify?: IdentifyFunction<Entity>;
  /**
   * Function to decide the outcome of the feature flag.
   * This function receives the identified entities and should return the result of the decision.
   */
  decide: DecideFunction<Entity, R>;
  /**
   * Whether to disable analytics tracking for this flag.
   * Default: false
   */
  disableAnalytics?: boolean;
}

/**
 * Context for evaluating command flags in CommandKit.
 */
export interface CommandFlagContext {
  /**
   * The Discord client instance.
   * This is the main entry point for interacting with the Discord API.
   */
  client: Client<true>;
  /**
   * The CommandKit instance, which provides access to the command framework.
   * This includes commands, events, and other features of CommandKit.
   */
  commandkit: CommandKit;
  /**
   * The command context, which includes information about the command being executed.
   * This can include the interaction, message, guild, channel, and the loaded command.
   */
  command: {
    /**
     * The interaction object if the command was invoked via an interaction.
     * This can be a ChatInputCommandInteraction, AutocompleteInteraction, or ContextMenuCommandInteraction.
     */
    interaction?:
      | ChatInputCommandInteraction
      | AutocompleteInteraction
      | ContextMenuCommandInteraction;
    /**
     * The message object if the command was invoked via a message.
     */
    message?: Message;
    /**
     * The guild where the command was invoked, if applicable.
     * This will be null for commands invoked in DMs.
     */
    guild: Guild | null;
    /**
     * The channel where the command was invoked.
     * This can be a text channel, DM channel, or any other type of text-based channel.
     */
    channel: TextBasedChannel | null;
    /**
     * The loaded command instance that is being executed.
     * This contains the command's metadata and logic.
     */
    command: LoadedCommand;
  };
  /**
   * The event context is null for command flags, as they are not tied to a specific event.
   * This is used to differentiate between command and event flags.
   */
  event: null;
}

/**
 * Context for evaluating event flags in CommandKit.
 */
export interface EventFlagContext {
  /**
   * The Discord client instance.
   * This is the main entry point for interacting with the Discord API.
   */
  client: Client<true>;
  /**
   * The CommandKit instance, which provides access to the command framework.
   * This includes commands, events, and other features of CommandKit.
   */
  commandkit: CommandKit;
  /**
   * The event context, which includes information about the event being processed.
   * This can include the parsed event data, the event name, and the namespace if applicable.
   */
  event: {
    /**
     * The parsed event data, which contains the raw data from the event.
     * This can include information like user IDs, channel IDs, and other relevant data.
     */
    data: ParsedEvent;
    /**
     * The name of the event being processed.
     * This is the string identifier for the event, such as 'messageCreate' or 'guildMemberAdd'.
     */
    event: string;
    /**
     * The namespace of the event, if applicable.
     * This can be used to group related events or commands together.
     * It is null if the event does not belong to a specific namespace.
     */
    namespace: string | null;
    /**
     * The arguments passed to the event handler.
     * This is an array of arguments that were passed when the event was triggered.
     * It can be used to access specific data related to the event.
     */
    arguments: any[];
    /**
     * A function to retrieve the arguments for a specific event type.
     * This allows for type-safe access to the arguments based on the event name.
     * @param event - The name of the event to retrieve arguments for.
     */
    argumentsAs<E extends keyof ClientEvents>(event: E): ClientEvents[E];
  };
  /**
   * The command context is null for event flags, as they are not tied to a specific command.
   * This is used to differentiate between command and event flags.
   */
  command: null;
}

/**
 * Combined context type for feature flag evaluation.
 */
export type EvaluationContext = CommandFlagContext | EventFlagContext;

/**
 * Function type for custom evaluation of feature flags.
 * This function can be used to provide a custom evaluation context for the flag.
 * It should return an object representing the entities to be evaluated.
 */
export type CustomEvaluationFunction<E> = () => MaybePromise<E>;

/**
 * Context for custom evaluation of feature flags.
 * This allows for more flexible evaluation based on custom logic or external data.
 * The identify function can be a direct object or a function that returns the entities.
 */
export type CustomEvaluationContext<E> = {
  /**
   * Optional function to identify the entities for evaluation.
   * This can be a function that returns the entities based on the current context.
   */
  identify: E | CustomEvaluationFunction<E>;
};

export interface FlagRunner<E, R> {
  /**
   * Execute the feature flag evaluation with the provided entities.
   * This method will run the identify and decide functions to determine the flag's outcome.
   * @param res - Optional entities to use for evaluation. If not provided, it will call the identify function.
   * @returns A promise that resolves to the result of the feature flag evaluation.
   */
  (): Promise<R>;
  /**
   * Run the feature flag evaluation with a custom context.
   * This allows for more flexible evaluation based on custom logic or external data.
   * @param context - The custom evaluation context containing the identify function or object.
   * @returns A promise that resolves to the result of the feature flag evaluation.
   */
  run(context: CustomEvaluationContext<E>): Promise<R>;
}

/**
 * Class representing a feature flag in CommandKit.
 */
export class FeatureFlag<R, T> {
  private commandkit: CommandKit;

  /**
   * Create a new feature flag.
   * @param options - The options for the feature flag.
   */
  public constructor(public readonly options: FeatureFlagDefinition<R, T>) {
    this.commandkit = getCommandKit(true);
    const FlagStore = this.commandkit.flags;

    if (FlagStore.has(options.key)) {
      throw new Error(`Feature flag with key "${options.key}" already exists.`);
    }

    FlagStore.set(options.key, this);
  }

  private getContext(): EvaluationContext {
    const env = getContext();

    if (env?.context) {
      const {
        client,
        commandkit,
        interaction,
        message,
        guild,
        channel,
        command,
      } = env.context;

      return {
        client: client as Client<true>,
        commandkit,
        command: {
          interaction,
          message,
          guild,
          channel,
          command,
        },
        event: null,
      };
    }

    const eventCtx = eventWorkerContext.getStore();

    if (eventCtx) {
      const { commandkit, data, event, namespace } = eventCtx;

      return {
        client: commandkit.client as Client<true>,
        commandkit,
        event: {
          data,
          event,
          namespace,
          arguments: eventCtx.arguments,
          argumentsAs: (eventName) => {
            const args = eventCtx.arguments as ClientEvents[typeof eventName];
            return args;
          },
        },
        command: null,
      };
    }

    throw new Error(
      'Could not determine the execution context. Feature flags may only be used inside a command or event.',
    );
  }

  /**
   * Execute the feature flag evaluation.
   * @param res - Optional entities to use for evaluation. If not provided, it will call the identify function.
   * @returns A promise that resolves to the result of the feature flag evaluation.
   */
  public async execute(res?: T): Promise<R> {
    const { decide, identify, disableAnalytics } = this.options;

    const identificationStart = performance.now();
    const entities =
      res ??
      (await (async () => {
        const ctx = this.getContext();
        return (await identify?.(ctx)) ?? ({} as T);
      })());
    const identificationTime = performance.now() - identificationStart;

    // Get provider configuration if global provider is available
    let providerConfig: FlagConfiguration | null = null;
    if (flagProvider) {
      try {
        providerConfig = await flagProvider.getFlag(this.options.key, entities);

        // If provider says flag is disabled, return early with default behavior
        if (providerConfig && !providerConfig.enabled) {
          // For boolean flags, return false; for others, let decide function handle it
          if (typeof decide === 'function') {
            const decisionResult = await decide({
              entities,
              provider: providerConfig,
            });
            return decisionResult as R;
          }
        }
      } catch (error) {
        Logger.error(
          `Error fetching flag provider configuration for "${this.options.key}": ${error}`,
        );
        // continue with local decision if provider fails
      }
    }

    const decisionStart = performance.now();
    const decisionResult = await decide({
      entities,
      provider: providerConfig,
    });
    const decisionTime = performance.now() - decisionStart;

    // Skip analytics if disabled
    if (!disableAnalytics) {
      defer(async () => {
        await this.commandkit.analytics.track({
          name: AnalyticsEvents.FEATURE_FLAG_METRICS,
          data: {
            flag: this.options.key,
            identificationTime: identificationTime.toFixed(2),
            decisionTime: decisionTime.toFixed(2),
            usedProvider: flagProvider !== null,
            providerEnabled: providerConfig?.enabled ?? null,
          },
        });
      });

      defer(async () => {
        await this.commandkit.analytics.track({
          name: AnalyticsEvents.FEATURE_FLAG_DECISION,
          id:
            entities &&
            typeof entities === 'object' &&
            'id' in entities &&
            typeof entities.id === 'string'
              ? entities.id
              : undefined,
          data: {
            flag: this.options.key,
            decision: JsonSerialize(decisionResult, 'unknown'),
            providerUsed: flagProvider !== null,
          },
        });
      });
    }

    return decisionResult as R;
  }
}

/**
 * Create a new feature flag.
 * @param options - The options for the feature flag.
 * @returns A new instance of the FeatureFlag class.
 */
export function flag<Returns = boolean, Entity = Record<any, any>>(
  options: FeatureFlagDefinition<Returns, Entity>,
): FlagRunner<Entity, Returns> {
  const flag = new FeatureFlag<Returns, Entity>(options);
  const runner = flag.execute.bind(flag, undefined) as FlagRunner<
    Entity,
    Returns
  >;

  runner.run = async function (ctx) {
    if (!ctx?.identify) {
      throw new Error(
        'Custom evaluation context must have an identify function or object.',
      );
    }

    const context = (
      typeof ctx === 'function'
        ? await (ctx as CustomEvaluationFunction<Entity>)()
        : ctx
    ) as Entity;

    const decisionResult = await flag.execute(context);

    return decisionResult;
  };

  return runner;
}
