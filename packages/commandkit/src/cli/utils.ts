import type { Ora } from 'ora';

let ora: typeof import('ora') | undefined;

/**
 * @private
 * @internal
 */
export async function createSpinner(text: string): Promise<Ora> {
  if (!ora) {
    ora = await import('ora');
  }

  return (ora.default || ora)({
    text,
    color: 'cyan',
  });
}
