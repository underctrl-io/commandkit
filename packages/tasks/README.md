# @commandkit/tasks

Task management plugin for CommandKit. Provides on-demand task creation and management with support for both static and dynamic tasks.

## Features

- **Static Tasks**: Define tasks in your codebase that run on schedules
- **Dynamic Tasks**: Create tasks on-demand from commands or events
- **Multiple Drivers**: Support for in-memory, SQLite, and BullMQ persistence
- **HMR Support**: Hot reload tasks during development
- **Flexible Scheduling**: Support for cron expressions, dates, and dynamic schedules

## Installation

```bash
npm install @commandkit/tasks
```

## Quick Start

### 1. Add the plugin to your CommandKit configuration

```ts
import { defineConfig } from 'commandkit/config';
import { tasks } from '@commandkit/tasks';

export default defineConfig({
  plugins: [tasks()],
});
```

### 2. Set up a driver

```ts
import { setDriver } from '@commandkit/tasks';
import { SQLiteDriver } from '@commandkit/tasks/sqlite';

setDriver(new SQLiteDriver('./tasks.db'));
```

### 3. Create static tasks

Create a file in `src/app/tasks/`:

```ts
import { task } from '@commandkit/tasks';

export default task({
  name: 'refresh-exchange-rate',
  schedule: { type: 'cron', value: '0 0 * * *' }, // daily at midnight
  async execute(ctx) {
    // Fetch latest exchange rates
    const rates = await fetchExchangeRates();
    await updateDatabase(rates);
  },
});
```

### 4. Create dynamic tasks from commands

```ts
import type { CommandData, ChatInputCommand } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import ms from 'ms';
import { createTask } from '@commandkit/tasks';

export const command: CommandData = {
  name: 'remind-me',
  description: 'Set a reminder',
  options: [
    {
      name: 'time',
      description: 'The time to remind after. Eg: 6h, 10m, 1d',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'message',
      description: 'The message to remind about.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const time = ctx.options.getString('time', true);
  const message = ctx.options.getString('message', true);
  const timeMs = Date.now() + ms(time as `${number}`);

  await createTask({
    name: 'reminder',
    data: {
      userId: ctx.interaction.user.id,
      message,
      channelId: ctx.interaction.channelId,
      setAt: Date.now(),
    },
    schedule: {
      type: 'date',
      value: timeMs,
    },
  });

  await ctx.interaction.reply(
    `I will remind you <t:${Math.floor(timeMs / 1000)}:R> for \`${message}\``,
  );
};
```

## API Reference

### Task Definition

```ts
interface TaskDefinition {
  name: string;
  schedule?: TaskSchedule;
  prepare?: (ctx: TaskContext) => Promise<boolean>;
  execute: (ctx: TaskContext) => Promise<void>;
}
```

### Schedule Types

```ts
type TaskSchedule = 
  | { type: 'cron'; value: string; timezone?: string }
  | { type: 'date'; value: Date | number; timezone?: string };
```

### Functions

#### `task(definition: TaskDefinition)`

Creates a task definition.

#### `createTask(task: TaskData)`

Creates a dynamic task.

#### `deleteTask(identifier: string)`

Deletes a scheduled task.

## Drivers

### SQLite Driver

Persistent job queue with recovery on restart.

```ts
import { SQLiteDriver } from '@commandkit/tasks/sqlite';

setDriver(new SQLiteDriver('./tasks.db'));
```

**Features:**
- Jobs recoverable on restart
- Persistent job data
- Cron expression support via cron-parser

### BullMQ Driver

Distributed task scheduling with Redis.

```ts
import { BullMQDriver } from '@commandkit/tasks/bullmq';

setDriver(new BullMQDriver({
  host: 'localhost',
  port: 6379,
}));
```

## License

MIT
