import type { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

export const data = {
    name: 'ping',
    description: 'Pong!',
};

export function run({ interaction }: { interaction: ChatInputCommandInteraction }) {
    interaction.reply('Pong!');
}

export const options: {
    userPermissions: PermissionResolvable;
} = {
    userPermissions: ['AddReactions', 'KickMembers'],
};
