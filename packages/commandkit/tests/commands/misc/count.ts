import type { SlashCommandProps, CommandOptions, CommandData } from '../../../src/index';
import { ButtonKit, createEffect, createSignal } from '../../../src/index';
import { ButtonStyle, ActionRowBuilder, ButtonInteraction } from 'discord.js';

export const data: CommandData = {
    name: 'count',
    description: 'Counter boi!',
};

function getButtons() {
    // prettier-ignore
    const dec = new ButtonKit()
        .setEmoji('➖')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('decrement');

    // prettier-ignore
    const reset = new ButtonKit()
        .setEmoji('0️⃣')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('reset');

    // prettier-ignore
    const inc = new ButtonKit()
        .setEmoji('➕')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('increment');

    // prettier-ignore
    const trash = new ButtonKit()
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('trash');

    // prettier-ignore
    const row = new ActionRowBuilder<ButtonKit>()
        .addComponents(dec, reset, inc, trash);

    return { dec, reset, inc, trash, row };
}

export async function run({ interaction }: SlashCommandProps) {
    const [count, setCount, dispose] = createSignal(0);
    const { dec, reset, inc, trash, row } = getButtons();

    let inter: ButtonInteraction;

    const message = await interaction.reply({
        content: `Count is ${count()}`,
        components: [row],
        fetchReply: true,
    });

    createEffect(() => {
        const value = count();

        inter?.update(`Count is ${value}`);
    });

    // prettier-ignore
    dec.onClick((interaction) => {
        inter = interaction;
        setCount((prev) => prev - 1);
    }, { message });

    // prettier-ignore
    reset.onClick((interaction) => {
        inter = interaction;
        setCount(0);
    }, { message });

    // prettier-ignore
    inc.onClick((interaction) => {
        inter = interaction;
        setCount((prev) => prev + 1);
    }, { message });

    // prettier-ignore
    trash.onClick(async (interaction) => {
        const disposed = row.setComponents(
            row.components.map((button) => button.setDisabled(true)),
        );
        
        await interaction.update({
            content: 'Finished counting!',
            components: [disposed],
        });
    }, { message });
}

export const options: CommandOptions = {
    devOnly: true,
};
