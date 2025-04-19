import type { TaskContext } from '../src';

// Define the data structure for the unmute task
export interface UnmuteTaskData {
  guildId: string;
  userId: string;
  reason?: string;
}

/**
 * Unmute task that removes the muted role from a user after a specified duration
 */
export default async function unmute(ctx: TaskContext<UnmuteTaskData>) {
  const { client, data, taskId } = ctx;
  const { guildId, userId, reason } = data;

  console.log(
    `[${new Date().toISOString()}] Running unmute task ${taskId} for user ${userId} in guild ${guildId}`,
  );

  try {
    // Get the guild
    const guild = await client.guilds.fetch(guildId);

    // Get the member
    const member = await guild.members.fetch(userId);

    // This would be the actual implementation to remove the muted role
    // In a real bot, you would have a configuration for the muted role ID
    // await member.roles.remove('muted-role-id');

    console.log(
      `Unmuted ${member.user.tag} ${reason ? `(Reason: ${reason})` : ''}`,
    );
  } catch (error) {
    console.error(
      `Failed to unmute user ${userId} in guild ${guildId}:`,
      error,
    );
  }
}
