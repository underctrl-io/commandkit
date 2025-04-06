import type { Locale } from 'discord.js';
import type { CommandLocalizationContext } from './i18n';
import { useEnvironment } from 'commandkit';

/**
 * Gets the localization context.
 * @param locale The locale to use. Defaults to the detected locale or the default locale.
 */
export function locale(locale?: Locale): CommandLocalizationContext {
  const env = useEnvironment();
  const context = env.context;

  if (!context) {
    throw new Error('No localization context found');
  }

  return context.locale(locale);
}
