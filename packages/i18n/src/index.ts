import { I18nPlugin, LocalizationPluginOptions } from './i18n';

export function i18n(options?: LocalizationPluginOptions) {
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

  return localization;
}

export * from './hooks';
