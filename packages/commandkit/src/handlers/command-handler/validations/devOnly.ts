import type { BuiltInValidationParams } from '../typings';
import { MessageFlags } from 'discord.js';

export default function ({
  interaction,
  targetCommand,
  handlerData,
}: BuiltInValidationParams) {
  if (interaction.isAutocomplete()) return;

  if (targetCommand.options?.devOnly) {
    if (
      interaction.inGuild() &&
      !handlerData.devGuildIds.includes(interaction.guildId)
    ) {
      interaction.reply({
        content: '❌ This command can only be used inside development servers.',
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }

    const guildMember = interaction.guild?.members.cache.get(
      interaction.user.id,
    );
    const memberRoles = guildMember?.roles.cache;

    let hasDevRole = false;

    memberRoles?.forEach((role) => {
      if (handlerData.devRoleIds.includes(role.id)) {
        hasDevRole = true;
      }
    });

    const isDevUser =
      handlerData.devUserIds.includes(interaction.user.id) || hasDevRole;

    if (!isDevUser) {
      interaction.reply({
        content: '❌ This command can only be used by developers.',
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }
  }
}
