import type { CommandBuilderLike } from 'commandkit';
import type { CommandTranslationMetadata } from './types';

export function applyTranslations(
  command: CommandBuilderLike,
  locale: string,
  translation: CommandTranslationMetadata,
): CommandBuilderLike {
  const json = 'toJSON' in command ? command.toJSON() : command;
  const { name, description, options } = translation;

  if (name) {
    json.name ??= name;
    json.name_localizations ??= {};
    json.name_localizations[locale] = name;
  }

  if (description) {
    json.description ??= description;
    json.description_localizations ??= {};
    json.description_localizations[locale] = description;
  }

  if (options) {
    json.options ??= [];
    const applyToOptions = (
      option: Record<string, any>,
      optionTranslation: Record<string, any>,
    ) => {
      const { name, description } = optionTranslation;
      if (name) {
        option.name ??= name;
        option.name_localizations ??= {};
        option.name_localizations[locale] = name;
      }

      if (description) {
        option.description ??= description;
        option.description_localizations ??= {};
        option.description_localizations[locale] = description;
      }

      if (option.options) {
        for (let i = 0; i < option.options.length; i++) {
          const subOption = option.options[i];
          const subOptionTranslation = optionTranslation.options?.[i];
          if (subOptionTranslation) {
            applyToOptions(subOption, subOptionTranslation);
          }
        }
      }
    };

    for (let i = 0; i < json.options.length; i++) {
      const cmdOption = json.options[i];
      const optionTranslation = options[i];

      if (optionTranslation) {
        if (Array.isArray(optionTranslation)) {
          for (const subOptionTranslation of optionTranslation) {
            applyToOptions(cmdOption, subOptionTranslation);
          }
        } else {
          applyToOptions(cmdOption, optionTranslation);
        }
      }
    }
  }

  return json;
}
