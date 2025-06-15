import stableHash from 'stable-hash';
import { createHash as createHashNode } from 'node:crypto';

/**
 * @private
 */
export function createHash(id: string, args: any[]): string {
  const objectHash = stableHash({
    id,
    args,
  });

  const hash = createHashNode('sha256').update(objectHash).digest('hex');

  return hash;
}
