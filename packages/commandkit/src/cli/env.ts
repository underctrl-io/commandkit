/**
 * @private
 * @internal
 */
export function DevEnv(_static = false) {
  const common = {
    NODE_ENV: 'development',
    COMMANDKIT_IS_DEV: 'true',
    COMMANDKIT_INTERNAL_IS_CLI_PROCESS: 'false',
    COMMANDKIT_IS_BUILD: 'false',
  };

  if (_static) return Object.assign({}, common);

  return Object.assign({}, process.env, common);
}

/**
 * @private
 * @internal
 */
export function ProdEnv(_static = false) {
  const common = {
    NODE_ENV: 'production',
    COMMANDKIT_IS_DEV: 'false',
    COMMANDKIT_INTERNAL_IS_CLI_PROCESS: 'false',
    COMMANDKIT_IS_BUILD: 'false',
  };

  if (_static) return Object.assign({}, common);

  return Object.assign({}, process.env, common);
}

/**
 * @private
 * @internal
 */
export const CommonEnvFiles = ['.env', '.env.local'];
/**
 * @private
 * @internal
 */
export const DevEnvFiles = ['.env.development', '.env.development.local'];
/**
 * @private
 * @internal
 */
export const ProdEnvFiles = ['.env.production', '.env.production.local'];
/**
 * @private
 * @internal
 */
export const devEnvFileArgs = [...CommonEnvFiles, ...DevEnvFiles];
/**
 * @private
 * @internal
 */
export const prodEnvFileArgs = [...CommonEnvFiles, ...ProdEnvFiles];
/**
 * @private
 * @internal
 */
export function setCLIEnv() {
  process.env.COMMANDKIT_IS_CLI = 'true';
}
