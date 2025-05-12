# CommandKit Devtools

This plugin provides a set of tools for working with CommandKit.

## Installation

```bash
npm install @commandkit/devtools
```

## Usage

To use the `@commandkit/devtools` plugin, you need to add it to your CommandKit application. This can be done by importing the plugin and adding it to your configuration.

```ts
import { devtools } from '@commandkit/devtools';
import { defineConfig } from 'commandkit';

export default defineConfig({
  plugins: [devtools()],
});
```

Now when you start your bot in development mode, this plugin will serve a web interface at `http://localhost:4356` where you can view and manage your CommandKit application.