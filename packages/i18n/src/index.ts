import { I18nPlugin, LocalizationPluginOptions } from './i18n';

export function i18n(options?: LocalizationPluginOptions) {
  const opt = Object.assign(
    {},
    {
      options: {
        disableFsBackend: false,
        loadPath: '/app/locales/{{lng}}/{{ns}}.js',
      },
      i18nOptions: {
        defaultNS: 'default',
        fallbackLng: 'en-US',
        load: 'currentOnly',
        saveMissing: false,
        partialBundledLanguages: true,
      },
    },
    options,
  );

  const localization = new I18nPlugin(opt);

  return localization;
}
