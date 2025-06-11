import {
  Awaitable,
  Events,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import {
  exitContext,
  getCommandKit,
  getContext,
} from '../../../context/async-context';
import {
  EventInterceptorContextData,
  EventInterceptorErrorHandler,
} from '../../common/EventInterceptor';

/**
 * The predicate function that filters modal interactions.
 * It receives a ModalSubmitInteraction and returns a boolean or a Promise that resolves to a boolean.
 */
export type ModalKitPredicate = (
  interaction: ModalSubmitInteraction,
) => Awaitable<boolean>;

/**
 * The handler to run when a modal is submitted. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnModalKitSubmit =
  CommandKitModalBuilderInteractionCollectorDispatch;

/**
 * The handler to run when the interaction collector ends. This handler is called with the reason as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnModalKitEnd = CommandKitModalBuilderOnEnd;

/**
 * The handler to run when a modal is submitted. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type CommandKitModalBuilderInteractionCollectorDispatch = (
  interaction: ModalSubmitInteraction,
  context: ModalKit,
) => Awaitable<void>;

/**
 * The handler to run when the interaction collector ends. This handler is called with the reason as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type CommandKitModalBuilderOnEnd = (reason: string) => Awaitable<void>;

/**
 * The context data for the interaction collector.
 * This includes the autoReset, time, filter, onEnd, and onError properties.
 */
export type CommandKitModalBuilderInteractionCollectorDispatchContextData =
  EventInterceptorContextData<Events.InteractionCreate>;

/**
 * A builder for creating modals with additional features like interaction collectors and event handling.
 * This class extends the ModalBuilder from discord.js and adds methods for handling interactions.
 * It allows you to set a handler for when the modal is submitted, filter interactions, and handle the end of the interaction collector.
 */
export class ModalKit extends ModalBuilder {
  #onSubmitHandler: CommandKitModalBuilderInteractionCollectorDispatch | null =
    null;
  #contextData: CommandKitModalBuilderInteractionCollectorDispatchContextData | null =
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
   * const modal = new ModalKit()
   *  .setTitle('My Modal')
   *  .setCustomId('my-modal')
   *  .filter((interaction) => interaction.user.id === '1234567890')
   *  .onSubmit(async (interaction) => {
   *     await interaction.reply('You submitted the modal!');
   *   })
   *   .addComponents(actionRow1, actionRow2);
   * ```
   */
  public onSubmit(
    handler: CommandKitModalBuilderInteractionCollectorDispatch,
    data?: CommandKitModalBuilderInteractionCollectorDispatchContextData,
  ): this {
    if (!handler) {
      throw new TypeError(
        'Cannot setup "onClick" without a handler function parameter.',
      );
    }

    if (this.#onSubmitHandler) {
      this.#destroyCollector();
    }

    this.#onSubmitHandler = handler;

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
  public onEnd(handler: CommandKitModalBuilderOnEnd): this {
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
  public filter(predicate: ModalKitPredicate): this {
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
        if (!interaction.isModalSubmit()) return;

        const myCustomId = this.customId ?? null;
        const interactionCustomId = interaction.customId;

        if (myCustomId && interactionCustomId !== myCustomId) return;

        const filter = this.#contextData?.filter;

        if (filter && !(await filter(interaction))) return;

        const handler = this.#onSubmitHandler;

        if (!handler) return this.#unsub?.();

        return handler(interaction, this);
      },
      this.#contextData,
    );
  }

  /**
   * Disposes of the modal collector and cleans up resources.
   */
  public dispose() {
    this.#destroyCollector();
    return this;
  }

  #destroyCollector() {
    this.#unsub?.();
    this.#unsub = null;
    this.#onSubmitHandler = null;
    this.#contextData = null;
  }
}
