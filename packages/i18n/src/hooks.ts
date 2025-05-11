import type { Locale } from 'discord.js';
import { getI18n, type CommandLocalizationContext } from './i18n';
import {
  useEnvironment,
  eventWorkerContext,
  CommandKitEnvironment,
} from 'commandkit';

/**
 * Gets the localization context. If the context originates from the event worker context, the returned t function is not bound to the command.
 * @param locale The locale to use. Defaults to the detected locale or the default locale.
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

    const i18n = getI18n(commandkit);
    const detectedLocale: Locale = locale || commandkit.config.defaultLocale;

    return {
      t: i18n.t,
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
