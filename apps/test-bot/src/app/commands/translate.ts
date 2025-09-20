import {
  ChatInputCommand,
  MessageCommand,
  MessageContextMenuCommand,
  UserContextMenuCommand,
} from 'commandkit';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export const command = new ContextMenuCommandBuilder()
  .setName('translate')
  .setType(ApplicationCommandType.User);

// export const command: CommandData = {
//   name: 'translate',
// };

export const userContextMenu: UserContextMenuCommand = async ({
  interaction,
}) => {
  interaction.reply('test');
};

export const messageContextMenu: MessageContextMenuCommand = async ({
  interaction,
}) => {
  interaction.reply('test');
};

export const chatInput: ChatInputCommand = async ({ interaction }) => {
  interaction.reply('test');
};

export const message: MessageCommand = async ({ message }) => {
  message.reply('test');
};
