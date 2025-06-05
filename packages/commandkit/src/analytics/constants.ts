import { randomUUID } from 'node:crypto';

export const DO_NOT_TRACK_KEY = `COMMANDKIT_ANALYTICS__DO_NOT_TRACK::${randomUUID()}`;
