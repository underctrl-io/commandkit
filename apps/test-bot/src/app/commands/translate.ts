import { MessageContextMenuCommand } from 'commandkit';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export const command = new ContextMenuCommandBuilder()
  .setName('translate')
  .setType(ApplicationCommandType.Message);

export const messageContextMenu: MessageContextMenuCommand = async ({
  interaction,
}) => {
  interaction.reply('test');
};
