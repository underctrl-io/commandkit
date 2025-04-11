# `@commandkit/i18n`

A commandkit plugin for i18next integration.

# Installation

```sh
$ npm i @commandkit/i18n
```

# Usage

Add the following to your commandkit config:

```ts
import { defineConfig } from "commandkit"
import { i18n } from "@commandkit/i18n"

export default defineConfig({
  plugins: [i18n()]
})
```

You can pass options to the plugin:

```ts
import { defineConfig } from "commandkit"
import { i18n } from "@commandkit/i18n"

export default defineConfig({
  plugins: [
    i18n({
      plugins: [i18nextPlugins]
    })
  ]
})
```

Create `locales` directory inside `src/app` and add your translation files. The directory structure should look like this:

```
src
└── app
    ├── locales
    │   ├── en-US
    │   │   └── ping.json
    │   └── fr
    │       └── ping.json
    └── commands
        └── ping.ts
```

CommandKit automatically localizes your commands if you follow the naming convention and translation file structure.

If your translation file contains `$command` key with localization object, it will be used to localize the command name and description.

```json
{
  "$command": {
    "name": "Ping",
    "description": "Ping the server",
    "options": [
      {
        "name": "database",
        "description": "Ping the database"
      }
    ]
  },
  "response": "Pong! The latency is {{latency}}ms"
}
```

The `$command` key defines localization for the command name and description (or options). These properties are later merged with the actual command to build the final command object with localizations that Discord understands. Anything else in the translation file is used to localize the command response.

This plugin adds `locale()` function to your command context. You can use it to localize your command responses.

```ts
export const chatInput: SlashCommand = async (ctx) => {
  // ctx.locale() auto infers the localization of the current guild
  // you can also pass a discord.js locale enum to use custom locale
  // ctx.locale("fr") // uses french locale
  const { t, i18n } = ctx.locale()
  //      |  |__ i18next instance
  //      |_____ TFunction

  ctx.interaction.reply({
    content: t("response", { latency: client.ping }),
    ephemeral: true
  })
}
```

Additionally, you can use the `locale()` function outside of the context to get the localization api. This is mostly useful if you are using `i18n` with legacy commands plugin.

```ts
import { locale } from "@commandkit/i18n"

export async function run({ interaction }) {
  const { t } = locale()

  return interaction.reply({
    content: t("response", { latency: client.ping }),
    ephemeral: true
  })
}
```

This function is identical to the one in the context and it can also infer the locale automatically.
