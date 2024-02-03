import { config } from 'dotenv-cra';
import { Environment } from '../environment/env';

export function loadEnv() {
  const type = Environment.getType();

  process.env.NODE_ENV = type;

  const result = config();

  return result.error?.message;
}
