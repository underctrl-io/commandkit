import {
  ChatInputCommand,
  CommandData,
  CommandMetadataFunction,
  Container,
  MessageCommand,
  TextDisplay,
} from 'commandkit';
import { Colors, MessageFlags } from 'discord.js';

export const command: CommandData = {
  name: 'components-test',
  description: 'Test components v2 again',
};

export const generateMetadata: CommandMetadataFunction = () => {
  return {
    aliases: ['ct'],
  };
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

export const message: MessageCommand = async (ctx) => {
  const container = (
    <Container accentColor={Colors.Fuchsia}>
      <TextDisplay content="# CommandKit Components v2 test" />
    </Container>
  );

  await ctx.message.reply({
    components: [container],

    flags: MessageFlags.IsComponentsV2,
  });
};
