import type { FeatureFlag } from './feature-flags';
import { Collection } from 'discord.js';

export class FlagStore extends Collection<string, FeatureFlag<any, any>> {}
