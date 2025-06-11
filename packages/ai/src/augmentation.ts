import { AiContext } from './context';
import { Awaitable } from 'discord.js';

declare module 'commandkit' {
  interface CustomAppCommandProps {
    ai?: (ctx: AiContext) => Awaitable<unknown>;
  }
}
