import { config } from 'dotenv-cra';

export function loadEnv(type: 'development' | 'production') {
  process.env.NODE_ENV = type;

  const result = config();

  return result.error?.message;
}
