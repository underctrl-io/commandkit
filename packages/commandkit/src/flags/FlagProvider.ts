import type { MaybePromise } from './feature-flags';

/**
 * Interface for external feature flag providers.
 * Implement this interface to integrate with external flag management systems
 * like LaunchDarkly, Split, Unleash, etc.
 */
export interface FlagProvider {
  /**
   * Initialize the provider (e.g., establish connections, load initial config)
   */
  initialize?(): MaybePromise<void>;

  /**
   * Get the current value/configuration for a feature flag
   * @param key - The feature flag key
   * @param context - Optional context for flag evaluation
   * @returns The flag configuration or null if not found
   */
  getFlag(key: string, context?: any): MaybePromise<FlagConfiguration | null>;

  /**
   * Check if a flag exists in the external system
   * @param key - The feature flag key
   */
  hasFlag(key: string): MaybePromise<boolean>;

  /**
   * Cleanup resources when the provider is no longer needed
   */
  destroy?(): MaybePromise<void>;
}

/**
 * Configuration returned by external flag providers
 */
export interface FlagConfiguration {
  /**
   * Whether the flag is enabled/disabled at the provider level
   */
  enabled: boolean;

  /**
   * Optional configuration data that can be used in the decide function
   */
  config?: Record<string, any>;

  /**
   * Optional percentage for gradual rollouts (0-100)
   */
  percentage?: number;

  /**
   * Optional targeting rules or segments
   */
  targeting?: {
    segments?: string[];
    rules?: Array<{
      condition: string;
      value: any;
    }>;
  };
}

/**
 * Example implementation for a simple JSON-based flag provider
 */
export class JsonFlagProvider implements FlagProvider {
  private flags: Map<string, FlagConfiguration> = new Map();

  public constructor(private config: Record<string, FlagConfiguration>) {
    Object.entries(config).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
  }

  public async getFlag(key: string): Promise<FlagConfiguration | null> {
    return this.flags.get(key) || null;
  }

  public async hasFlag(key: string): Promise<boolean> {
    return this.flags.has(key);
  }

  public async destroy(): Promise<void> {
    this.flags.clear();
  }
}
