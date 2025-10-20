import { task } from '@commandkit/tasks';

export interface RemindTaskData {
  userId: string;
  channelId: string;
  message: string;
}

export default task<RemindTaskData>({
  name: 'remind',
  async execute(ctx) {
    const { userId, channelId, message } = ctx.data;
    const client = ctx.client;
    const channel = await client.channels.fetch(channelId);

    if (!channel?.isSendable()) {
      const user = await client.users.fetch(userId);
      await user.send({
        embeds: [
          {
            title: 'You asked me to remind you about:',
            description: message,
            color: 0x0099ff,
          },
        ],
      });

      return;
    }

    await channel.send({
      content: `<@${userId}>`,
      embeds: [
        {
          title: 'You asked me to remind you about:',
          description: message,
          color: 0x0099ff,
        },
      ],
    });
  },
});
