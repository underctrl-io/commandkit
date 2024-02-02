import { ChannelType, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Giveaway related commands')
  .addSubcommand((cmd) =>
    cmd
      .setName('create')
      .setDescription('Create a giveaway with a modal')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The channel you would like to send the giveaway to')
          .addChannelTypes(ChannelType.GuildText),
      )
      .addRoleOption((option) =>
        option
          .setName('ping-role')
          .setDescription('The role you would like to ping for this giveaway'),
      ),
  )
  .addSubcommand((cmd) =>
    cmd
      .setName('end')
      .setDescription('End a giveaway early')
      .addStringOption((option) =>
        option
          .setName('giveaway-id')
          .setDescription('The Message ID for the giveaway')
          .setRequired(true),
      ),
  )
  .addSubcommand((cmd) =>
    cmd
      .setName('list')
      .setDescription('List all active giveaways for this server'),
  );

export function run() {}

export const options = {
  devOnly: true,
  // deleted: true,
};
