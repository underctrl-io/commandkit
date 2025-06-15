import type { Locale } from 'discord.js';
import { useI18n, type CommandLocalizationContext } from './i18n';
import {
  useEnvironment,
  eventWorkerContext,
  CommandKitEnvironment,
} from 'commandkit';
import { TFunction } from 'i18next';

/**
 * Gets the localization context. If the context originates from the event worker context, the returned t function is not bound to the command.
 * @param locale The locale to use. Defaults to the detected locale or the default locale.
 * @example const { t, locale, i18n } = locale('en-US');
 * const translated = t('hello'); // Translates 'hello' in the 'en-US' locale
 */
export function locale(locale?: Locale): CommandLocalizationContext {
  let env: CommandKitEnvironment | undefined;

  try {
    env = useEnvironment();
  } catch {}

  if (!env) {
    const context = eventWorkerContext.getStore();

    if (!context) {
      throw new Error('No localization context found');
    }

    const commandkit = context.commandkit;

    const i18n = useI18n(commandkit);
    const detectedLocale: Locale = locale || commandkit.config.defaultLocale;

    return {
      t: i18n.getFixedT(detectedLocale, `${context.event}.event`),
      locale: detectedLocale,
      i18n,
      isEventWorker: true,
    };
  }

  const context = env.context;

  if (!context) {
    throw new Error('No localization context found');
  }

  return context.locale(locale);
}

/**
 * Fetches the translation function for the given locale and namespace.
 * @param lng The locale to use.
 * @param ns The namespace to use.
 * @param keyPrefix The key prefix to use.
 * @returns The translation function.
 * @example
 * const t = fetchT('en-US', 'common');
 * const translated = t('hello'); // Translates 'hello' in the 'en-US' locale
 */
export function fetchT(
  lng: string | string[],
  ns?: string | null,
  keyPrefix?: string,
): TFunction {
  return useI18n().getFixedT(lng, ns, keyPrefix);
}
