import { useClient } from 'commandkit/hooks';

export async function greetUser(userId: string, again = false) {
  'use step';

  const client = useClient<true>();

  const user = await client.users.fetch(userId);

  const message = again ? 'Hello again!' : 'Hello!';

  await user.send(message);
}
