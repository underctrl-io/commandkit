import { Awaitable, Events } from 'discord.js';
import { EventInterceptorContextData } from '../../common/EventInterceptor';

/**
 * The predicate function that filters select menu interactions.
 * It receives an interaction and returns a boolean or a Promise that resolves to a boolean.
 */
export type SelectMenuKitPredicate<T> = (interaction: T) => Awaitable<boolean>;

/**
 * The handler to run when a modal is submitted. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnSelectMenuKitSubmit<T, C> =
  CommandKitSelectMenuBuilderInteractionCollectorDispatch<T, C>;

/**
 * The handler to run when the interaction collector ends. This handler is called with the reason as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnSelectMenuKitEnd = CommandKitSelectMenuBuilderOnEnd;

/**
 * The handler to run when a modal is submitted. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type CommandKitSelectMenuBuilderInteractionCollectorDispatch<T, C> = (
  interaction: T,
  context: C,
) => Awaitable<void>;

export type CommandKitSelectMenuBuilderOnEnd = (
  reason: string,
) => Awaitable<void>;

export type CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData =
  EventInterceptorContextData<Events.InteractionCreate>;
