import { I18nCliTemplatePlugin } from './cli';
import { I18nPlugin, LocalizationPluginOptions } from './i18n';

/**
 * Returns the i18n plugin and CLI template plugin.
 * This function initializes the i18n plugin with the provided options and returns both the i18n plugin and the CLI template plugin.
 * @param options The options for the i18n plugin. If not provided, default options will be used.
 * @returns A tuple containing the i18n plugin and the CLI template plugin.
 */
export function i18n(
  options?: LocalizationPluginOptions,
): [I18nPlugin, I18nCliTemplatePlugin] {
  const opt = {
    ...options,
    i18nOptions: {
      defaultNS: 'default',
      fallbackLng: 'en-US',
      load: 'currentOnly',
      saveMissing: false,
      partialBundledLanguages: true,
      ...options?.i18nOptions,
    },
  } as LocalizationPluginOptions;

  const localization = new I18nPlugin(opt);

  return [localization, new I18nCliTemplatePlugin({})];
}

export { I18nCliTemplatePlugin };
export { locale, fetchT } from './hooks';
export { getI18n, I18nPlugin, type CommandLocalizationContext } from './i18n';
