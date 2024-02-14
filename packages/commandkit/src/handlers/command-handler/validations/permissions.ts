import type { BuiltInValidationParams } from '../typings';
import { EmbedBuilder } from 'discord.js';

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

  const formatter = new Intl.ListFormat('pl-PL', {
    style: 'long',
    type: 'conjunction',
  });

  const getPermissionWord = (permissions: string[]) =>
    permissions.length === 1 ? 'permission' : 'permissions';

  if (missingUserPermissions.length) {
    const formattedPermissions = missingUserPermissions.map((p) => `\`${p}\``);
    const permissionsString = formatter.format(formattedPermissions);

    embedDescription += `- Do wykonania tej komendy potrzebujsz uprawnienia ${permissionsString} ${getPermissionWord(
      missingUserPermissions,
    )}.\n`;
  }

  if (missingBotPermissions.length) {
    const formattedPermissions = missingBotPermissions.map((p) => `\`${p}\``);
    const permissionsString = formatter.format(formattedPermissions);

    embedDescription += `- Do wykonania tej komendy potrzebuję uprawnienia ${permissionsString} ${getPermissionWord(
      missingBotPermissions,
    )}.\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Brak uprawnień!`)
    .setDescription(embedDescription)
    .setColor('Red');

  interaction.reply({ embeds: [embed], ephemeral: true });
  return true;
}
