export function DevEnv(_static = false) {
  const common = {
    NODE_ENV: 'development',
    COMMANDKIT_IS_DEV: 'true',
  };

  if (_static) return Object.assign({}, common);

  return Object.assign({}, process.env, common);
}

export function ProdEnv(_static = false) {
  const common = {
    NODE_ENV: 'production',
    COMMANDKIT_IS_DEV: 'false',
  };

  if (_static) return Object.assign({}, common);

  return Object.assign({}, process.env, common);
}

export const CommonEnvFiles = ['.env', '.env.local'];
export const DevEnvFiles = ['.env.development', '.env.development.local'];
export const ProdEnvFiles = ['.env.production', '.env.production.local'];

export const devEnvFileArgs = [...CommonEnvFiles, ...DevEnvFiles];

export const prodEnvFileArgs = [...CommonEnvFiles, ...ProdEnvFiles];

export function setCLIEnv() {
  process.env.COMMANDKIT_IS_CLI = 'true';
}
