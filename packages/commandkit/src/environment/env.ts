export const CKitInternalEnvState = {
  $env__type: 'unknown',
};

export const Environment = Object.preventExtensions({
  isDevelopment() {
    return CKitInternalEnvState.$env__type === 'development';
  },
  isProduction() {
    return CKitInternalEnvState.$env__type === 'production';
  },
  isUnknown() {
    const { $env__type } = CKitInternalEnvState;
    return $env__type !== 'development' && $env__type !== 'production';
  },
  getType() {
    if (Environment.isUnknown()) {
      return 'development';
    }

    return CKitInternalEnvState.$env__type;
  },
} as const);
