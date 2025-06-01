import { I18nCliTemplatePlugin } from './cli';
import { I18nPlugin, LocalizationPluginOptions } from './i18n';

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
export { locale } from './hooks';
export { getI18n, I18nPlugin, type CommandLocalizationContext } from './i18n';
