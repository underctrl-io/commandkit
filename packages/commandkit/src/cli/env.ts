import { join } from 'node:path';

export function DevEnv() {
  return Object.assign({}, process.env, {
    NODE_ENV: 'development',
    COMMANDKIT_IS_DEV: 'true',
  });
}

export function ProdEnv() {
  return Object.assign({}, process.env, {
    NODE_ENV: 'production',
    COMMANDKIT_IS_DEV: 'false',
  });
}

export const CommonEnvFiles = ['.env'];
export const DevEnvFiles = [
  '.env.development',
  '.env.development.local',
  '.env.local',
];
export const ProdEnvFiles = [
  '.env.production',
  '.env.production.local',
  '.env.local',
];

export const devEnvFileArgs = [...CommonEnvFiles, ...DevEnvFiles];

export const prodEnvFileArgs = [...CommonEnvFiles, ...ProdEnvFiles];
