import {
  Events,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuInteraction,
} from 'discord.js';
import {
  exitContext,
  getCommandKit,
  getContext,
} from '../../../context/async-context';
import { EventInterceptorErrorHandler } from '../../common/EventInterceptor';
import {
  CommandKitSelectMenuBuilderInteractionCollectorDispatch,
  CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData,
  CommandKitSelectMenuBuilderOnEnd,
  OnSelectMenuKitSubmit,
  SelectMenuKitPredicate,
} from './common';

/**
 * Type for the handler function that is called when the mentionable select menu is submitted.
 */
export type OnMentionableSelectMenuKitSubmit = OnSelectMenuKitSubmit<
  MentionableSelectMenuInteraction,
  MentionableSelectMenuKit
>;

/**
 * Type for the predicate function that filters mentionable select menu interactions.
 * It receives a MentionableSelectMenuInteraction and returns a boolean or a Promise that resolves to a boolean.
 */
export type MentionableSelectMenuKitPredicate =
  SelectMenuKitPredicate<MentionableSelectMenuInteraction>;

export class MentionableSelectMenuKit extends MentionableSelectMenuBuilder {
  #onSelectHandler: CommandKitSelectMenuBuilderInteractionCollectorDispatch<
    MentionableSelectMenuInteraction,
    MentionableSelectMenuKit
  > | null = null;
  #contextData: CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData | null =
    {
      autoReset: false,
      time: 5 * 60 * 1000,
      once: true,
    };
  #unsub: (() => void) | null = null;

  #getEventInterceptor() {
    const ctx = getContext();
    if (!ctx) return getCommandKit(true).eventInterceptor;

    return exitContext(() => ctx.commandkit.eventInterceptor);
  }

  /**
   * Sets the handler to run when the modal is submitted.
   * @param handler - The handler to run when the modal is submitted.
   * @param data - The context data for the interaction collector.
   * @returns This instance of the modal builder.
   * @example
   * ```ts
   * const modal = new MentionableSelectMenuKit()
   *  .setTitle('My Modal')
   *  .setCustomId('my-modal')
   *  .filter((interaction) => interaction.Mentionable.id === '1234567890')
   *  .onSelect(async (interaction) => {
   *     await interaction.reply('You submitted the modal!');
   *   })
   *   .addComponents(actionRow1, actionRow2);
   * ```
   */
  public onSelect(
    handler: CommandKitSelectMenuBuilderInteractionCollectorDispatch<
      MentionableSelectMenuInteraction,
      MentionableSelectMenuKit
    >,
    data?: CommandKitSelectMenuBuilderInteractionCollectorDispatchContextData,
  ): this {
    if (!handler) {
      throw new TypeError(
        'Cannot setup "onClick" without a handler function parameter.',
      );
    }

    if (this.#onSelectHandler) {
      this.#destroyCollector();
    }

    this.#onSelectHandler = handler;

    if (data) {
      this.#contextData = {
        autoReset: data.autoReset ?? this.#contextData?.autoReset ?? true,
        time: data.time ?? this.#contextData?.time ?? 5 * 60 * 1000,
        filter: data.filter ?? this.#contextData?.filter,
        onEnd: data.onEnd ?? this.#contextData?.onEnd,
      };
    }

    this.#setupCollector();

    return this;
  }

  /**
   * Sets the handler to run when the interaction collector ends.
   * @param handler - The handler to run when the interaction collector ends.
   * @returns This instance of the modal builder.
   */
  public onEnd(handler: CommandKitSelectMenuBuilderOnEnd): this {
    if (!handler) {
      throw new TypeError(
        'Cannot setup "onEnd" without a handler function parameter.',
      );
    }

    this.#contextData ??= {};
    this.#contextData.onEnd = handler;

    return this;
  }

  /**
   * Sets the handler to run when the interaction collector ends.
   * @param handler - The handler to run when the interaction collector ends.
   * @returns This instance of the modal builder.
   */
  public onError(handler: EventInterceptorErrorHandler): this {
    if (!handler) {
      throw new TypeError(
        'Cannot setup "onError" without a handler function parameter.',
      );
    }

    this.#contextData ??= {};
    this.#contextData.onError = handler;

    return this;
  }

  /**
   * Sets a filter for the interaction collector.
   * @param predicate - The filter to use for the interaction collector.
   * @returns This instance of the modal builder.
   */
  public filter(
    predicate: SelectMenuKitPredicate<MentionableSelectMenuInteraction>,
  ): this {
    this.#contextData ??= {
      autoReset: true,
      time: 5 * 60 * 1000,
    };
    // @ts-ignore
    this.#contextData.filter = predicate;

    return this;
  }

  private get customId() {
    // @ts-ignore
    return this.data.custom_id ?? this.data.customId;
  }

  #setupCollector() {
    if (!this.#contextData) return;

    if (!this.customId) {
      throw new TypeError(
        'Cannot setup an modal collector without a custom ID.',
      );
    }

    const interceptor = this.#getEventInterceptor();
    if (!interceptor) return;

    this.#unsub = interceptor.subscribe(
      Events.InteractionCreate,
      async (interaction) => {
        if (!interaction.isMentionableSelectMenu()) return;

        const myCustomId = this.customId ?? null;
        const interactionCustomId = interaction.customId;

        if (myCustomId && interactionCustomId !== myCustomId) return;

        const filter = this.#contextData?.filter;

        if (filter && !(await filter(interaction))) return;

        const handler = this.#onSelectHandler;

        if (!handler) return this.#unsub?.();

        return handler(interaction, this);
      },
      this.#contextData,
    );
  }

  /**
   * Disposes of the mentionable select menu kit, cleaning up any resources used by the interaction collector.
   */
  public dispose() {
    this.#destroyCollector();
    return this;
  }

  #destroyCollector() {
    this.#unsub?.();
    this.#unsub = null;
    this.#onSelectHandler = null;
    this.#contextData = null;
  }
}
