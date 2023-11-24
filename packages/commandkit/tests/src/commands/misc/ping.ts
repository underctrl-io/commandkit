import { ActionRowBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandProps, CommandOptions, CommandData, ButtonKit } from '../../../../src/index';

export const data: CommandData = {
    name: 'ping',
    description: 'Pong!',
};

export async function run({ interaction, client }: SlashCommandProps) {
    if (!interaction.channel) return;

    const button = new ButtonKit()
        .setCustomId('ping_btn')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Ping Button!');

    const row = new ActionRowBuilder<ButtonKit>().addComponents(button);

    const message = await interaction.reply({
        content: 'Click the button',
        components: [row],
        fetchReply: true,
    });

    button.onClick(
        (interaction) => {
            interaction.reply({
                content: 'You clicked the ping button!',
                ephemeral: true,
            });
        },
        { message, time: 10_000, autoReset: true },
    );

    interaction.reply(`:ping_pong: Pong! \`${client.ws.ping}ms\``);
}

export const options: CommandOptions = {
    devOnly: true,
};
