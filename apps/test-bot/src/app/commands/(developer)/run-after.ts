import { CommandData, afterCommand, SlashCommand } from 'commandkit';

export const command: CommandData = {
  name: 'run-after',
  description: 'This is a run-after command',
};

export const chatInput: SlashCommand = async ({ interaction }) => {
  afterCommand((env) => {
    console.log(
      `The command ${interaction.commandName} was executed successfully in ${env
        .getExecutionTime()
        .toFixed(2)} milliseconds!`,
    );
  });

  await interaction.reply(
    'Hello, you will see a new message printed in your console after this command runs.',
  );
};
