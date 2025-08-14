import { task } from '@commandkit/tasks';

export interface RemindTaskData {
  userId: string;
  message: string;
  channelId: string;
  setAt: number;
}

export default task<RemindTaskData>({
  name: 'remind',
  async execute(ctx) {
    const { userId, message, channelId, setAt } = ctx.data;

    const channel = await ctx.client.channels.fetch(channelId);

    if (!channel?.isTextBased() || !channel.isSendable()) return;

    await channel.send({
      content: `<@${userId}>`,
      embeds: [
        {
          title: `You asked me <t:${Math.floor(setAt / 1000)}:R> to remind you about:`,
          description: message,
          color: 0x0099ff,
          timestamp: new Date(setAt).toISOString(),
        },
      ],
    });
  },
});
