# `@commandkit/tasks`

CommandKit plugin for managing tasks, including scheduling and executing them. This plugin is designed to work with the CommandKit framework, providing a simple and efficient way to handle background tasks in your applications.

## Installation

```bash
npm install @commandkit/tasks
```

## Usage

To use the `@commandkit/tasks` plugin, you need to add it to your CommandKit application. This can be done by importing the plugin and adding it to your configuration.

```ts
import { tasks } from '@commandkit/tasks';

export default defineConfig({
  plugins: [
    tasks(),
  ],
})
```

Next, you can define advanced configurations for the plugin:

```ts
import { configureTaskManager, bullmq } from '@commandkit/tasks';

configureTaskManager((manager) => {
  const driver = bullmq({
    redis: {
      host: 'localhost',
      port: 6379,
    },
    queue: 'my-queue',
  });

  manager.useDriver(driver);
});
```

# Creating Tasks

CommandKit has two types of tasks: **dynamic** and **static**. Dynamic tasks are created at runtime, while static tasks are defined at bootstrap time. Dynamic tasks are typically used for one-time execution, such as unmuting a user after a delay. Static tasks are scheduled to run at specific intervals, similar to cron jobs.

## Static Tasks

Static tasks can be defined by creating a file in the `app/tasks` directory. The file should export a default function that takes a `TaskContext` argument. This function will be executed when the task is triggered.

```ts
// app/tasks/refresh-exchange-rate.ts
import type { TaskContext, TaskConfig } from '@commandkit/tasks';

export const config: TaskConfig = {
  name: 'refresh-exchange-rate', // uses file name by default
  // repeating
  pattern: '0 0 * * *', // run every 24 hours
  every: '1 day', // alternative to pattern
};

export default async function refreshExchangeRate(ctx: TaskContext) {
  // ctx contains client and commandkit instances
  const { client, commandkit } = ctx;

  // fetch new exchange rate
}
```

## Dynamic Tasks

Dynamic tasks are created at runtime and can be scheduled to run after a specified duration. They can also be cancelled or invoked manually. To create a dynamic task, use the `tasks.create` method from the `ctx` object.

### Defining a task

```ts
// app/tasks/unmute.ts
import type { TaskContext, TaskConfig } from '@commandkit/tasks';

export interface UnmuteTaskData {
  guildId: string;
  userId: string;
}

export default async function unmute(ctx: TaskContext<UnmuteTaskData>) {
  const { guildId, userId } = ctx.data;

  // handle unmute logic
  const guild = ctx.client.guilds.get(guildId);
  if (!guild) return;

  const member = guild.members.get(userId);
  if (!member) return;

  await member.roles.remove('muted-role-id');
}
```

Then, you can create a dynamic task in your command:

```ts
// app/commands/mute.ts
import type { CommandData, SlashCommand } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';

export const command: CommandData = {
  name: 'mute',
  description: 'Mute a user for a specified duration',
  options: [
    {
      name: 'user',
      description: 'User to mute',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'duration',
      description: 'Duration to mute the user. Eg: 1d, 2h, 30m',
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ]
};

export const chatInput: SlashCommand = async (ctx) => {
  const userToMute = ctx.options.getUser('user', true);
  const duration = ctx.options.getString('duration', true);

  // ..handle mute logic here

  // create unmute task
  const task = await ctx.tasks.create({
    name: 'unmute', // must match the task name
    id: `unmute:${ctx.guildId}:${userToMute.id}`, // optional but useful if you plan on cancelling or updating this task
    data: { guildId: ctx.guildId, userId: userToMute.id }, // json serializable data to be sent to the task
    duration,
  });
};
```

You can also cancel or update the task:

```ts
// Cancel the task
await ctx.tasks.cancel(task.id);

// Update the task
await ctx.tasks.update(task.id, {
  data: { guildId: ctx.guildId, userId: userToMute.id },
  duration: '2d',
});
```
