function compareLocalizations(
  first: Record<string, string> | undefined,
  second: Record<string, string> | undefined,
): boolean {
  if (!first && !second) return true;
  if (!first || !second) return false;

  const keys1 = Object.keys(first);
  const keys2 = Object.keys(second);
  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => first[key] === second[key]);
}

function compareArrays(
  arr1: any[] | undefined,
  arr2: any[] | undefined,
): boolean {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;

  return arr1.every((item, index) => {
    const item2 = arr2[index];
    return Object.keys(item).every((key) => {
      if (Array.isArray(item[key])) {
        return compareArrays(item[key], item2[key]);
      }
      if (key.endsWith('_localizations')) {
        return compareLocalizations(item[key], item2[key]);
      }
      return item[key] === item2[key];
    });
  });
}

export default function areSlashCommandsDifferent(
  appCommand: any,
  localCommand: any,
) {
  if (!appCommand.options) appCommand.options = [];
  if (!localCommand.options) localCommand.options = [];

  if (!appCommand.description) appCommand.description = '';
  if (!localCommand.description) localCommand.description = '';

  // Check basic properties
  if (
    localCommand.description !== appCommand.description ||
    localCommand.options?.length !== appCommand.options?.length ||
    !compareLocalizations(
      localCommand.name_localizations,
      appCommand.name_localizations,
    ) ||
    !compareLocalizations(
      localCommand.description_localizations,
      appCommand.description_localizations,
    )
  ) {
    return true;
  }

  // Check options in detail
  return !compareArrays(localCommand.options, appCommand.options);
}
