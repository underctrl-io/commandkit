import { getCommandKit, getContext } from '../context/async-context';
import { eventWorkerContext } from '../app/events/EventWorkerContext';
import { ParsedEvent } from '../app/router';
import { CommandKit } from '../CommandKit';
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

export type MaybePromise<T> = T | Promise<T>;

export type IdentifyFunction<R> = (
  context: EvaluationContext,
) => MaybePromise<R>;

export type DecideFunction<E, R> = (data: { entities: E }) => MaybePromise<R>;

export interface FeatureFlagDefinition<R, Entity> {
  key: string;
  description?: string;
  identify?: IdentifyFunction<Entity>;
  decide: DecideFunction<Entity, R>;
}

export interface CommandFlagContext {
  client: Client<true>;
  commandkit: CommandKit;
  command: {
    interaction?:
      | ChatInputCommandInteraction
      | AutocompleteInteraction
      | ContextMenuCommandInteraction;
    message?: Message;
    guild: Guild | null;
    channel: TextBasedChannel | null;
    command: LoadedCommand;
  };
  event: null;
}

export interface EventFlagContext {
  client: Client<true>;
  commandkit: CommandKit;
  event: {
    data: ParsedEvent;
    event: string;
    namespace: string | null;
    arguments: any[];
    argumentsAs<E extends keyof ClientEvents>(event: E): ClientEvents[E];
  };
  command: null;
}

export type EvaluationContext = CommandFlagContext | EventFlagContext;

export type CustomEvaluationFunction<E> = () => MaybePromise<E>;

export type CustomEvaluationContext<E> = {
  identify: E | CustomEvaluationFunction<E>;
};

export interface FlagRunner<E, R> {
  (): Promise<R>;
  run(context: CustomEvaluationContext<E>): Promise<R>;
}

export class FeatureFlag<R, T> {
  private commandkit: CommandKit;
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

  public async execute(res?: T): Promise<R> {
    const { decide, identify } = this.options;

    const identificationStart = performance.now();
    const entities =
      res ??
      (await (async () => {
        const ctx = this.getContext();
        return (await identify?.(ctx)) ?? ({} as T);
      })());
    const identificationTime = performance.now() - identificationStart;

    const decisionStart = performance.now();
    const decisionResult = await decide({
      entities,
    });
    const decisionTime = performance.now() - decisionStart;

    defer(async () => {
      await this.commandkit.analytics.track({
        name: AnalyticsEvents.FEATURE_FLAG_METRICS,
        data: {
          flag: this.options.key,
          identificationTime: identificationTime.toFixed(2),
          decisionTime: decisionTime.toFixed(2),
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
        },
      });
    });

    return decisionResult as R;
  }
}

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
