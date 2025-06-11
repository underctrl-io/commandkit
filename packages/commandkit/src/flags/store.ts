import type { FeatureFlag } from './feature-flags';
import { Collection } from 'discord.js';

/**
 * Represents a store for feature flags.
 * This store extends the Collection class to manage feature flags by their keys.
 */
export class FlagStore extends Collection<string, FeatureFlag<any, any>> {}
