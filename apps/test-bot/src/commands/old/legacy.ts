import type { CommandData, SlashCommandProps } from '@commandkit/legacy';
import { locale } from '@commandkit/legacy';

export const data: CommandData = {
  name: 'legacy',
  description: 'Pong!',
};

export async function run({ interaction }: SlashCommandProps) {
  const { t } = await locale<'legacy'>();

  const message = await t('greet', { user: interaction.user.username });

  await interaction.reply(message);
}
