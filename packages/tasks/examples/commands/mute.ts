import { CommandData, SlashCommand } from 'commandkit';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { UnmuteTaskData } from '../unmute';

export const command: CommandData = {
  name: 'mute',
  description: 'Mute a user for a specified duration',
  options: [
    {
      name: 'user',
      description: 'The user to mute',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'duration',
      description: 'Duration of the mute (e.g., 30m, 1h, 2d)',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason for the mute',
      type: ApplicationCommandOptionType.String,
    },
  ],
  defaultMemberPermissions: [PermissionFlagsBits.ModerateMembers],
};

export const chatInput: SlashCommand = async (ctx) => {
  const userToMute = ctx.options.getUser('user', true);
  const duration = ctx.options.getString('duration', true);
  const reason = ctx.options.getString('reason');

  try {
    // Get the member to mute
    const member = await ctx.guild?.members.fetch(userToMute.id);

    if (!member) {
      return ctx.reply({
        content: '❌ Could not find that user in this server.',
        ephemeral: true,
      });
    }

    // In a real implementation, you would add a muted role here
    // await member.roles.add('muted-role-id');

    // Create a task to unmute the user after the specified duration
    const task = await ctx.tasks.create({
      name: 'unmute', // must match the name of the task file
      data: {
        guildId: ctx.guild?.id as string,
        userId: userToMute.id,
        reason,
      } as UnmuteTaskData,
      duration: duration,
    });

    await ctx.reply({
      content: `✅ ${userToMute} has been muted for ${duration}. They will be automatically unmuted. (Task ID: ${task.id})`,
    });

    // You could also save the task ID to a database to reference it later
    // This allows you to cancel or update the task if needed
  } catch (error) {
    console.error('Error in mute command:', error);
    await ctx.reply({
      content: '❌ An error occurred while trying to mute that user.',
      ephemeral: true,
    });
  }
};

// Example of how to cancel a mute task early (e.g., in an unmute command)
export async function cancelMuteTask(ctx: any, userId: string) {
  // You would need to retrieve the task ID from your database
  // const taskId = await getTaskIdFromDatabase(guildId, userId);
  const taskId = 'task-id-from-database';

  if (taskId) {
    await ctx.tasks.cancel(taskId);
    console.log(`Cancelled unmute task for user ${userId}`);
  }
}
