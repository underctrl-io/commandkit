# @commandkit/workflow

CommandKit plugin for [useworkflow.dev](https://useworkflow.dev).

## Installation

```bash
npm install @commandkit/workflow workflow
```

## Usage

```typescript
import { defineConfig } from 'commandkit/config';
import { workflow } from '@commandkit/workflow';

export default defineConfig({
  plugins: [workflow()],
});
```

Then, add workflow functions inside `src/workflows` directory.

```typescript
import { sleep } from 'workflow';
import { useClient } from 'commandkit/hooks';

export async function greetUserWorkflow(userId: string) {
  'use workflow';

  await greetUser(userId);

  await sleep('5 seconds');

  await greetUser(userId, true);

  return { success: true };
}

async function greetUser(userId: string, again = false) {
  'use step';

  const client = useClient<true>();

  const user = await client.users.fetch(userId);

  const message = again ? 'Hello again!' : 'Hello!';

  await user.send(message);
}
```

Now, you can run the workflow using the `start` function in your commands (or other places).

```typescript
import { start } from 'workflow/api';
import {greetUserWorkflow} from '@/workflows/greet';

export const command: CommandData = {
    name: 'greet',
    description: 'Greet command',
};

export const chatInput: ChatInputCommand = async (ctx) => {
    await ctx.interaction.reply("I'm gonna greet you :wink:");
    await start(greetUserWorkflow, [ctx.interaction.user.id]);
}
```

## Documentation
https://commandkit.dev/docs/next/api-reference/workflow

