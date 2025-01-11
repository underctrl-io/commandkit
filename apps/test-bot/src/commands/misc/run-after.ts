import { SlashCommandProps, CommandData, after } from 'commandkit';

export const data: CommandData = {
  name: 'run-after',
  description: 'This is a run-after command',
};

export async function run({ interaction }: SlashCommandProps) {
  after((env) => {
    console.log(
      `The command ${interaction.commandName} was executed successfully in ${env
        .getExecutionTime()
        .toFixed(2)} milliseconds!`,
    );
  });

  await interaction.reply(
    'Hello, you will see a new message printed in your console after this command runs.',
  );
}
