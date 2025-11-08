import { commandkit } from 'commandkit';

export async function greetUser(userId: string, again = false) {
  'use step';

  const user = await commandkit.client.users.fetch(userId);

  const message = again ? 'Hello again!' : 'Hello!';

  await user.send(message);
}
