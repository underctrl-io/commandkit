import { Locale } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { TranslationResult } from './LocalizationStrategy';
import {
  CommandLocalizationTypeData,
  TranslatableArguments,
  TranslatableCommandName,
} from './Translation';

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

// Improved Translator type for better autocomplete
export type Translator<T extends TranslatableCommandName> = <
  K extends keyof CommandLocalizationTypeData[T] & string,
>(
  key: K,
  // If args corresponding to this key is null, don't allow second argument
  args?: CommandLocalizationTypeData[T][K] extends null
    ? never
    : CommandLocalizationTypeData[T][K] extends string
      ? Record<CommandLocalizationTypeData[T][K], string>
      : Record<string, string>,
) => Promise<TranslationResult>;

export class Localization<T extends TranslatableCommandName = string> {
  /**
   * Translates the given translatable object.
   * @param translatable The translatable object to translate.
   */
  public readonly t: Translator<T>;

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

    // we are doing this so that it can be destructured
    // eg: const { t } = ctx.locale()
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
