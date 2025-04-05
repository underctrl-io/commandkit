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
