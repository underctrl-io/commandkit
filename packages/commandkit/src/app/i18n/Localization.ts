import { Locale } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import {
  LocalizationTranslationRequest,
  TranslationResult,
} from './LocalizationStrategy';
import { TranslatableArguments } from './Translation';

export interface LocalizationConfig {
  /**
   * The locale to use for localization.
   */
  locale: Locale;
  /**
   * The internalization data target.
   */
  target: string;
}

export type Translator = (
  translatable: string,
  args: TranslatableArguments,
) => Promise<TranslationResult>;

export class Localization {
  /**
   * Translates the given translatable object.
   * @param translatable The translatable object to translate.
   */
  public readonly t: Translator;

  /**
   * Creates a new localization instance.
   * @param commandkit The command kit instance.
   * @param config The localization configuration.
   */
  public constructor(
    private readonly commandkit: CommandKit,
    private readonly config: LocalizationConfig,
  ) {
    const strategy = this.commandkit.config.localizationStrategy;
    const { locale, target } = this.config;

    this.t = (translatable, args) => {
      return strategy.translate({
        args,
        key: translatable,
        locale,
        scope: target,
      });
    };
  }

  /**
   * Get the localization strategy.
   */
  public getStrategy() {
    return this.commandkit.config.localizationStrategy;
  }

  /**
   * Get the default locale
   */
  public getDefaultLocale() {
    return this.commandkit.config.defaultLocale;
  }

  /**
   * Get the current locale
   */
  public getLocale() {
    return this.config.locale;
  }

  /**
   * Get the localization target
   */
  public getTarget() {
    return this.config.target;
  }
}
