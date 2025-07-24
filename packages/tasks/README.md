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
import { tasks } from '@commandkit/tasks';

export default {
  plugins: [
    tasks({
      tasksPath: 'app/tasks', // optional, defaults to 'app/tasks'
      enableHMR: true, // optional, defaults to true in development
    }),
  ],
};
```

### 2. Create static tasks

Create a file in `src/app/tasks/`:

```ts
import { task } from '@commandkit/tasks';

export const refreshExchangeRate = task({
  name: 'refresh-exchange-rate',
  schedule: '0 0 * * *', // cron expression - daily at midnight
  async execute(ctx) {
    // Fetch latest exchange rates
    const rates = await fetchExchangeRates();
    await updateDatabase(rates);
  },
});

export const cleanupOldData = task({
  name: 'cleanup-old-data',
  schedule: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  async prepare(ctx) {
    // Only run if there's old data to clean
    return await hasOldData();
  },
  async execute(ctx) {
    await cleanupOldRecords();
  },
});
```

### 3. Create dynamic tasks from commands

```ts
import { createTask } from '@commandkit/tasks';

export default {
  name: 'remind-me',
  description: 'Set a reminder',
  async run(ctx) {
    const time = ctx.interaction.options.getString('time');
    const reason = ctx.interaction.options.getString('reason');
    
    await createTask({
      name: 'reminder',
      schedule: new Date(Date.now() + ms(time)),
      data: {
        userId: ctx.interaction.user.id,
        reason,
      },
    });
    
    await ctx.interaction.reply('Reminder set!');
  },
};
```

## API Reference

### Plugin Options

```ts
interface TasksPluginOptions {
  tasksPath?: string; // Path to tasks directory, defaults to 'app/tasks'
  enableHMR?: boolean; // Enable HMR for tasks, defaults to true in development
}
```

### Task Definition

```ts
interface TaskDefinition {
  name: string;
  schedule?: ScheduleType;
  prepare?: (ctx: TaskContext) => Promise<boolean> | boolean;
  execute: (ctx: TaskContext) => Promise<void> | void;
}
```

### Schedule Types

```ts
type ScheduleType = 
  | Date 
  | number // unix timestamp
  | string // cron expression or date string
  | (() => Date | number | string); // dynamic schedule
```

**Cron Expressions**: The plugin supports standard cron expressions (e.g., `'0 0 * * *'` for daily at midnight). Cron parsing is handled by `cron-parser` for in-memory and SQLite drivers, while BullMQ uses its built-in cron support.

### Task Context

```ts
interface TaskContext {
  task: TaskData;
  commandkit: CommandKit;
  client: Client;
}
```

### Functions

#### `task(definition: TaskDefinition)`

Creates a task definition.

```ts
import { task } from '@commandkit/tasks';

export const myTask = task({
  name: 'my-task',
  schedule: '0 0 * * *',
  async execute(ctx) {
    // Task logic here
  },
});
```

#### `createTask(options: CreateTaskOptions)`

Creates a dynamic task.

```ts
import { createTask } from '@commandkit/tasks';

await createTask({
  name: 'reminder',
  schedule: new Date(Date.now() + 60000), // 1 minute from now
  data: { userId: '123', message: 'Hello!' },
});
```

#### `executeTask(taskOrName: TaskDefinition | string)`

Executes a task immediately.

```ts
import { executeTask } from '@commandkit/tasks';

await executeTask('my-task');
// or
await executeTask(myTask);
```

#### `cancelTask(taskOrName: TaskDefinition | string)`

Cancels a scheduled task.

```ts
import { cancelTask } from '@commandkit/tasks';

await cancelTask('my-task');
```

#### `pauseTask(taskOrName: TaskDefinition | string)`

Pauses a task.

```ts
import { pauseTask } from '@commandkit/tasks';

await pauseTask('my-task');
```

#### `resumeTask(taskOrName: TaskDefinition | string)`

Resumes a paused task.

```ts
import { resumeTask } from '@commandkit/tasks';

await resumeTask('my-task');
```

## Persistence Drivers

The drivers handle all scheduling and timing internally. When a task is due for execution, the driver calls the plugin's execution handler.

### In-Memory Driver (Default)

```ts
import { driver } from '@commandkit/tasks';
import { InMemoryDriver } from '@commandkit/tasks/drivers';

driver.use(new InMemoryDriver());
```

### SQLite Driver

```ts
import { driver } from '@commandkit/tasks';
import { SQLiteDriver } from '@commandkit/tasks/drivers';

driver.use(new SQLiteDriver('./tasks.db'));
```

**Note**: Requires `sqlite3`, `sqlite`, and `cron-parser` packages to be installed.

### BullMQ Driver

```ts
import { driver } from '@commandkit/tasks';
import { BullMQDriver } from '@commandkit/tasks/drivers';

driver.use(new BullMQDriver({
  host: 'localhost',
  port: 6379,
}));
```

**Note**: Requires `bullmq` package to be installed. BullMQ has built-in cron support, so no additional cron parsing is needed.

## Examples

### Scheduled Database Backup

```ts
import { task } from '@commandkit/tasks';

export const databaseBackup = task({
  name: 'database-backup',
  schedule: '0 2 * * *', // Daily at 2 AM
  async execute(ctx) {
    const backup = await createBackup();
    await uploadToCloud(backup);
    await ctx.client.channels.cache.get('backup-log')?.send('Backup completed!');
  },
});
```

### User Reminder System

```ts
import { task } from '@commandkit/tasks';

export const reminder = task({
  name: 'reminder',
  async execute(ctx) {
    const { userId, message } = ctx.task.data;
    const user = await ctx.client.users.fetch(userId);
    await user.send(`Reminder: ${message}`);
  },
});
```

### Conditional Task

```ts
import { task } from '@commandkit/tasks';

export const maintenanceCheck = task({
  name: 'maintenance-check',
  schedule: '0 */6 * * *', // Every 6 hours
  async prepare(ctx) {
    // Only run if maintenance mode is not enabled
    return !ctx.commandkit.store.get('maintenance-mode');
  },
  async execute(ctx) {
    await performMaintenanceChecks();
  },
});
```

## License

MIT
