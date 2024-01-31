import type { SlashCommandProps, CommandOptions, CommandData } from '../../../../dist';
import { ButtonKit, createEffect, createSignal } from '../../../../dist/index.mjs';
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
    const [count, setCount, disposeCountSubscribers] = createSignal(0);
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

    const disposeButtons = async (interaction: ButtonInteraction | null = null) => {
        const disposed = row.setComponents(
            row.components.map((button) => button.onClick(null).setDisabled(true)),
        );

        // Dispose the count's subscribers
        disposeCountSubscribers();

        const data = {
            content: 'Finished counting!',
            components: [disposed],
        };

        if (interaction) await interaction.update(data);
        else await message.edit(data);
    };

    // prettier-ignore
    dec.onClick((interaction) => {
        if (!interaction) return disposeButtons();
        inter = interaction;
        setCount((prev) => prev - 1);
    }, { message });

    // prettier-ignore
    reset.onClick((interaction) => {
        if (!interaction) return disposeButtons();
        inter = interaction;
        setCount(0);
    }, { message });

    // prettier-ignore
    inc.onClick((interaction) => {
        if (!interaction) return disposeButtons();
        inter = interaction;
        setCount((prev) => prev + 1);
    }, { message });

    // prettier-ignore
    trash.onClick(async (interaction) => {
        disposeButtons(interaction);
    }, { message });
}

export const options: CommandOptions = {
    devOnly: true,
};
