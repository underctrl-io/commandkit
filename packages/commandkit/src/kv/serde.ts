import { SerializerType } from './constants';

export interface SerializedValue {
  t: SerializerType;
  v: any;
}

export function serializer(value: any): SerializedValue {
  if (value === null) {
    return { t: SerializerType.Null, v: null };
  }

  if (value === undefined) {
    return { t: SerializerType.Undefined, v: undefined };
  }

  if (typeof value === 'string') {
    return { t: SerializerType.String, v: value };
  }

  if (typeof value === 'number') {
    return { t: SerializerType.Number, v: value };
  }

  if (typeof value === 'boolean') {
    return { t: SerializerType.Boolean, v: value };
  }

  if (typeof value === 'bigint') {
    return { t: SerializerType.BigInt, v: value.toString() };
  }

  if (value instanceof Date) {
    return { t: SerializerType.Date, v: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return { t: SerializerType.Array, v: value };
  }

  if (value instanceof Map) {
    return { t: SerializerType.Map, v: Array.from(value.entries()) };
  }

  if (value instanceof Set) {
    return { t: SerializerType.Set, v: Array.from(value) };
  }

  if (Buffer.isBuffer(value)) {
    return { t: SerializerType.Buffer, v: value.toString('base64') };
  }

  if (value instanceof RegExp) {
    return {
      t: SerializerType.RegExp,
      v: { source: value.source, flags: value.flags },
    };
  }

  if (typeof value === 'object') {
    return { t: SerializerType.Object, v: value };
  }

  // Fallback to string
  return { t: SerializerType.String, v: String(value) };
}

export function deserializer(serialized: SerializedValue): any {
  switch (serialized.t) {
    case SerializerType.Null:
      return null;
    case SerializerType.Undefined:
      return undefined;
    case SerializerType.String:
      return serialized.v;
    case SerializerType.Number:
      return serialized.v;
    case SerializerType.Boolean:
      return serialized.v;
    case SerializerType.BigInt:
      return BigInt(serialized.v);
    case SerializerType.Date:
      return new Date(serialized.v);
    case SerializerType.Array:
      return serialized.v;
    case SerializerType.Map:
      return new Map(serialized.v);
    case SerializerType.Set:
      return new Set(serialized.v);
    case SerializerType.Buffer:
      return Buffer.from(serialized.v, 'base64');
    case SerializerType.RegExp:
      return new RegExp(serialized.v.source, serialized.v.flags);
    case SerializerType.Object:
      return serialized.v;
    default:
      return serialized.v;
  }
}
