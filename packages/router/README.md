# CommandKit Router

A flexible router for discovering and managing command files in a directory structure for CommandKit.

## Features

- Automatic command discovery
- Nested command support through directory structure
- Middleware inheritance from parent directories
- Configurable file matching patterns
- Full TypeScript support with type definitions

## Installation

```sh
npm install @commandkit/router
```

## Usage

### CommandsRouter

The `CommandsRouter` class is a file system-based command router for CommandKit. It scans a directory for command and middleware files and builds a command tree.

```js
import { CommandsRouter } from '@commandkit/router';

const router = new CommandsRouter({
  entrypoint: './app/commands',
});

const tree = await router.scan();

// =>
{
  "commands": {
    "command": { // commandName => attributes
      "name": "command",
      "parent": null,
      "path": "/path/to/command.js",
      "middlewares": [
        "1234567890" // middlewareId reference from middlewares object
      ]
    }
  },
  "middlewares": {
    "1234567890": { // middlewareId => attributes
      "name": "middleware",
      "path": "/path/to/middleware.js"
    }
  }
}