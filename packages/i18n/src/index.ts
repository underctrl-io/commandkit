import { I18nPlugin, LocalizationPluginOptions } from './i18n';
import { Locale } from 'discord.js';

export function i18n(options?: LocalizationPluginOptions) {
  return new I18nPlugin(
    options ?? {
      options: {
        disableFsBackend: false,
        loadPath: '/locales/{{lng}}/{{ns}}.js',
      },
      i18nOptions: {
        defaultNS: '',
        ns: [],
        fallbackLng: 'en-US',
        load: 'currentOnly',
        preload: ['en-US', 'fr'],
        saveMissing: false,
        partialBundledLanguages: true,
      },
    },
  );
}
