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

### Removed

-   `guildOnly` from docs examples.
-   `guildOnly` deprecation warning.
