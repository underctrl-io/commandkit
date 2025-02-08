import {
  type Awaitable,
  type ButtonInteraction,
  ButtonStyle,
  ButtonBuilder,
  Events,
} from 'discord.js';
import {
  exitContext,
  getCommandKit,
  getContext,
} from '../../context/async-context';
import {
  EventInterceptorContextData,
  EventInterceptorErrorHandler,
} from '../common/EventInterceptor';

export type ButtonKitPredicate = (
  interaction: ButtonInteraction,
) => Awaitable<boolean>;

/**
 * The handler to run when a button is clicked. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnButtonKitClick =
  CommandKitButtonBuilderInteractionCollectorDispatch;

/**
 * The handler to run when the interaction collector ends. This handler is called with the reason as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type OnButtonKitEnd = CommandKitButtonBuilderOnEnd;

/**
 * The handler to run when a button is clicked. This handler is called with the interaction as the first argument.
 * If the first argument is null, it means that the interaction collector has been destroyed.
 */
export type CommandKitButtonBuilderInteractionCollectorDispatch = (
  interaction: ButtonInteraction,
  context: ButtonKit,
) => Awaitable<void>;

export type CommandKitButtonBuilderOnEnd = (reason: string) => Awaitable<void>;

export type CommandKitButtonBuilderInteractionCollectorDispatchContextData =
  EventInterceptorContextData<Events.InteractionCreate>;

export class ButtonKit extends ButtonBuilder {
  #onClickHandler: CommandKitButtonBuilderInteractionCollectorDispatch | null =
    null;
  #contextData: CommandKitButtonBuilderInteractionCollectorDispatchContextData | null =
    {
      autoReset: true,
      time: 5 * 60 * 1000,
      once: false,
    };
  #unsub: (() => void) | null = null;

  #getEventInterceptor() {
    const ctx = getContext();
    if (!ctx) return getCommandKit(true).eventInterceptor;

    return exitContext(() => ctx.commandkit.eventInterceptor);
  }

  /**
   * Sets up an inline interaction collector for this button. This collector by default allows as many interactions as possible if it is actively used.
   * If unused, this expires after 24 hours or custom time if specified.
   * @param handler The handler to run when the button is clicked
   * @param data The context data to use for the interaction collector
   * @returns This button
   * @example
   * ```ts
   * const button = new ButtonKit()
   *   .setLabel('Click me')
   *   .setStyle(ButtonStyle.Primary)
   *   .setCustomId('click_me')
   *   .filter((interaction) => interaction.user.id === '1234567890')
   *   .onClick(async (interaction) => {
   *     await interaction.reply('You clicked me!');
   *   });
   *
   * const row = new ActionRowBuilder().addComponents(button);
   *
   * const message = await channel.send({ content: 'Click the button', components: [row] });
   *
   * // Remove onClick handler and destroy the interaction collector
   * button.onClick(null);
   * ```
   */
  public onClick(
    handler: CommandKitButtonBuilderInteractionCollectorDispatch,
    data?: CommandKitButtonBuilderInteractionCollectorDispatchContextData,
  ): this {
    if (this.data.style === ButtonStyle.Link) {
      throw new TypeError('Cannot setup "onClick" handler on link buttons.');
    }

    if (!handler) {
      throw new TypeError(
        'Cannot setup "onClick" without a handler function parameter.',
      );
    }

    if (this.#onClickHandler) {
      this.#destroyCollector();
    }

    this.#onClickHandler = handler;
    if (data) {
      this.#contextData = {
        autoReset: data.autoReset ?? this.#contextData?.autoReset ?? true,
        time: data.time ?? this.#contextData?.time ?? 5 * 60 * 1000,
        filter: data.filter ?? this.#contextData?.filter,
        onEnd: data.onEnd ?? this.#contextData?.onEnd,
      };
    }

    this.#setupInteractionCollector();

    return this;
  }

  public onEnd(handler: CommandKitButtonBuilderOnEnd): this {
    if (this.data.style === ButtonStyle.Link) {
      throw new TypeError('Cannot setup "onEnd" handler on link buttons.');
    }

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
   * @param predicate The filter to use for the interaction collector
   */
  public filter(predicate: ButtonKitPredicate): this {
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

  #setupInteractionCollector() {
    if (
      this.data.style === ButtonStyle.Link ||
      !this.#contextData ||
      !this.#onClickHandler
    )
      return;

    const myCustomId = this.customId ?? null;

    if (myCustomId === null) {
      throw new TypeError(
        'Cannot setup "onClick" handler on a button without a custom id.',
      );
    }

    const interceptor = this.#getEventInterceptor();

    this.#unsub = interceptor.subscribe(
      Events.InteractionCreate,
      async (interaction) => {
        if (!interaction.isButton()) return;

        const myCustomId = this.customId ?? null;
        const interactionCustomId = interaction.customId;

        if (myCustomId && interactionCustomId !== myCustomId) return;

        const filter = this.#contextData?.filter;

        if (filter && !(await filter(interaction))) return;

        const handler = this.#onClickHandler;

        if (!handler) return this.#unsub?.();

        return handler(interaction, this);
      },
      this.#contextData,
    );
  }

  public dispose() {
    this.#destroyCollector();
    return this;
  }

  #destroyCollector() {
    this.#unsub?.();
    this.#unsub = null;
    this.#contextData = null;
    this.#onClickHandler = null;
  }
}
