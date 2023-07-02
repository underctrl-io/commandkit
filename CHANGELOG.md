# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)

## [0.0.8] - 2023-07-03

### Added

- Support for nested files inside of each event folder.

## [0.0.7] - 2023-07-02

### Changed

- Give validation functions access to the full command object (commandObj) excluding the run function (as that is handled by the command handler), as opposed to just the `data` and `options` properties.

## [0.0.6] - 2023-07-02

### Fixed

- Fixed a bug where wrong event names were being registered on Windows.

## [0.0.5] - 2023-07-02

### Added

- Ability to automatically update application commands (guilds and global) when there's changes to the description or number of options (slash commands only).

## [0.0.4] - 2023-07-01

### Updated

- Update package.json with new URLs, scripts, and version

## [0.0.3] - 2023-07-01

## [0.0.2] - 2023-07-01

## [0.0.1] - N/A
