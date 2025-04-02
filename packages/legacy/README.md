# `@commandkit/legacy`

Legacy command handler plugin for CommandKit.

## Installation

```sh
npm install @commandkit/legacy
```

## Usage

This package provides a commandkit plugin that enables legacy command handler.

```js
import { legacy } from '@commandkit/legacy';

export default defineConfig({
  plugins: [legacy()],
});
```

This plugin also enables HMR for legacy commands, events and validations.

### Using localization api with legacy commands

Since localization api is accessed through `ctx.locale()` in commandkit, legacy commands are not able to use this api as `ctx` is not exposed to legacy commands to maintain backward compatibility. In order to use the localization api with legacy commands, this plugin exposes `locale()` hook to access the localization api.

```js
import { locale } from '@commandkit/legacy';

export const data = {
  name: 'hello',
  description: 'Say hello',
};

export async function run({ interaction }) {
  // initialize the localization api
  const { t } = locale();

  // use the localization api
  const message = await t('hello', {
    name: interaction.user.username,
  });

  // send the message
  await interaction.reply(message);
}
```

> The `locale()` function can only be called inside the `run` function of the legacy command (or any other functions invoked inside the `run` function).