import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from 'commandkit';

export const data: CommandData = {
  name: 'ping',
  description: 'Replies with Pong',
};

export const run = ({ interaction }: SlashCommandProps) => {
  interaction.reply('Pong!');
};

export const options: CommandOptions = {
  // https://commandkit.js.org/typedef/CommandOptions
};
