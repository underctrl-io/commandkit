import type { BuiltInValidationParams } from '../typings';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default function ({
  interaction,
  targetCommand,
}: BuiltInValidationParams) {
  if (interaction.isAutocomplete()) return;
  const userPermissions = interaction.memberPermissions;
  let userPermissionsRequired = targetCommand.options?.userPermissions;
  let missingUserPermissions: string[] = [];

  if (typeof userPermissionsRequired === 'string') {
    userPermissionsRequired = [userPermissionsRequired];
  }

  const botPermissions = interaction.guild?.members.me?.permissions;
  let botPermissionsRequired = targetCommand.options?.botPermissions;
  let missingBotPermissions: string[] = [];

  if (typeof botPermissionsRequired === 'string') {
    botPermissionsRequired = [botPermissionsRequired];
  }

  if (!userPermissionsRequired?.length && !botPermissionsRequired?.length) {
    return;
  }

  if (userPermissions && userPermissionsRequired) {
    for (const permission of userPermissionsRequired) {
      const hasPermission = userPermissions.has(permission);

      if (!hasPermission) {
        missingUserPermissions.push(permission);
      }
    }
  }

  if (botPermissions && botPermissionsRequired) {
    for (const permission of botPermissionsRequired) {
      const hasPermission = botPermissions.has(permission);

      if (!hasPermission) {
        missingBotPermissions.push(permission);
      }
    }
  }

  if (!missingUserPermissions.length && !missingBotPermissions.length) {
    return;
  }

  // Fix casing. e.g. KickMembers -> Kick Members
  const pattern = /([a-z])([A-Z])|([A-Z]+)([A-Z][a-z])/g;

  missingUserPermissions = missingUserPermissions.map((str) =>
    str.replace(pattern, '$1$3 $2$4'),
  );
  missingBotPermissions = missingBotPermissions.map((str) =>
    str.replace(pattern, '$1$3 $2$4'),
  );

  let embedDescription = '';

  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });

  const getPermissionWord = (permissions: string[]) =>
    permissions.length === 1 ? 'permission' : 'permissions';

  if (missingUserPermissions.length) {
    const formattedPermissions = missingUserPermissions.map((p) => `\`${p}\``);
    const permissionsString = formatter.format(formattedPermissions);

    embedDescription += `- You must have the ${permissionsString} ${getPermissionWord(
      missingUserPermissions,
    )} to be able to run this command.\n`;
  }

  if (missingBotPermissions.length) {
    const formattedPermissions = missingBotPermissions.map((p) => `\`${p}\``);
    const permissionsString = formatter.format(formattedPermissions);

    embedDescription += `- I must have the ${permissionsString} ${getPermissionWord(
      missingBotPermissions,
    )} to be able to execute this command.\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle(`:x: Missing permissions!`)
    .setDescription(embedDescription)
    .setColor('Red');

  interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  return true;
}
