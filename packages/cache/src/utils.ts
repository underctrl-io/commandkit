import { createHash } from 'node:crypto';

let tracker = 0n;

const references = new WeakMap<any, bigint>();
const PRIMITIVE_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'bigint',
  'undefined',
]);

function isSerializablePrimitive(value: any): boolean {
  return value === null || PRIMITIVE_TYPES.has(typeof value);
}

function createKey(val: any) {
  return `commandkit:cache:object:${val}`;
}

// returns runtime object id of the given argument
function getObjectId(obj: any): string {
  const primitive = isSerializablePrimitive(obj);
  if (primitive) return createKey(obj);

  if (obj instanceof Date) return createKey(obj.getTime());
  if (obj instanceof RegExp) return createKey(obj);

  const ref = references.get(obj);
  if (ref) return createKey(ref);

  const id = tracker++;

  references.set(obj, id);

  return createKey(id);
}

export async function createObjectHash(...args: any[]): Promise<string> {
  const serializedKey = args.map(getObjectId).join(':');

  try {
    const hash = createHash('sha256');
    hash.update(serializedKey);
    return hash.digest('hex');
  } catch {
    return serializedKey;
  }
}
