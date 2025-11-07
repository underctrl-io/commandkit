import { sleep } from 'workflow';
import { greetUser } from './steps/greet.step';

export async function greetUserWorkflow(userId: string) {
  'use workflow';

  await greetUser(userId);

  await sleep('5 seconds');

  await greetUser(userId, true);

  return { success: true };
}
