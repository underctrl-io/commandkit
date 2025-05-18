import {
  ChatInputCommand,
  CommandData,
  Container,
  TextDisplay,
} from 'commandkit';
import { Colors, MessageFlags } from 'discord.js';

export const command: CommandData = {
  name: 'components-test',
  description: 'Test components v2 again',
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const container = (
    <Container accentColor={Colors.Fuchsia}>
      <TextDisplay content="# CommandKit Components v2 test" />
    </Container>
  );

  await ctx.interaction.reply({
    components: [container],

    flags: MessageFlags.IsComponentsV2,
  });
};
