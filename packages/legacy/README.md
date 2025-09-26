# ❌ DEPRECATED: This package is deprecated and will be removed in the future.

---

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
