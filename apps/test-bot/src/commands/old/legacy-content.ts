import {
  type CommandData,
  type ContextMenuCommandProps,
} from '@commandkit/legacy';
import { ApplicationCommandType } from 'discord.js';

export const data: CommandData = {
  name: 'legacy-content',
  type: ApplicationCommandType.Message,
};

export function run({ interaction }: ContextMenuCommandProps) {
  interaction.reply(`The message is: ${interaction.targetMessage.content}`);
}
