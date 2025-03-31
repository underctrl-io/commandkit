import type { CommandData, SlashCommandProps } from '@commandkit/legacy';

export const data: CommandData = {
  name: 'legacy',
  description: 'Pong!',
};

export function run({ interaction, client }: SlashCommandProps) {
  interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
}
