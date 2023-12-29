# Changelog

All notable changes to this project will be documented in this file.

## [0.1.10] - 2023-12-12

### Fixed

-   CommonJS projects crash when using commandkit cli with watch mode.

### Added

-   add `onEnd` to ButtonKit

## [0.1.9] - 2023-12-12

### Changes (breaking)

-   Update `ValidationFunctionProps` type name to `ValidationProps`.
-   Update `autocompleteRun` command function name to `autocomplete`.
-   Update `AutocompleteCommandProps` type name to `AutocompleteProps`.

### Deprecated

-   `guildOnly` in command options. CommandKit no longer handles the `guildOnly` condition. Use `dm_permission` in your command `data` object instead.

### Fixed

-   Broken docs links.

### Added

-   `ValidationProps` type definition.

## [0.1.10 - dev] - 2023-12-29

### Fixed

-   Typos during command load/reload in specific guild (REST).

### Changed

-   Use `process.emitWarning()` for warnings instead of regular console logs.
-   Throw an error if a global command registration/deletion fails instead of just logging (for legacy command registation).

### Removed

-   `guildOnly` from docs examples. Closes [#42](https://github.com/underctrl-io/commandkit/issues/42)
-   `guildOnly` deprecation warning.
-   Emojis from logs, warnings, and errors.
