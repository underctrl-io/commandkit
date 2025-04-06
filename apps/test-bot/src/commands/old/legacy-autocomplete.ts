import type { AutocompleteProps, SlashCommandProps } from '@commandkit/legacy';
import { SlashCommandBuilder } from 'discord.js';

const pets = [
  { id: '1', name: 'Dog', type: 'Mammal' },
  { id: '2', name: 'Cat', type: 'Mammal' },
  { id: '3', name: 'Parrot', type: 'Bird' },
  { id: '4', name: 'Goldfish', type: 'Fish' },
  { id: '5', name: 'Turtle', type: 'Reptile' },
  { id: '6', name: 'Hamster', type: 'Mammal' },
  { id: '7', name: 'Lizard', type: 'Reptile' },
  { id: '8', name: 'Frog', type: 'Amphibian' },
];

export const data = new SlashCommandBuilder()
  .setName('legacy-autocomplete')
  .setDescription('Find a pet from a list of pets.')
  .addStringOption((option) =>
    option
      .setName('pet')
      .setDescription('The pet to check.')
      .setRequired(true)
      .setAutocomplete(true),
  );

export function run({ interaction }: SlashCommandProps) {
  const targetPetId = interaction.options.getString('pet');
  const targetPetObj = pets.find((pet) => pet.id === targetPetId);

  interaction.reply(`Your pet name is ${targetPetObj!.name}.`);
}

export function autocomplete({ interaction }: AutocompleteProps) {
  const focusedPetOption = interaction.options.getFocused();

  if (!focusedPetOption) {
    interaction.respond(pets.map((pet) => ({ name: pet.name, value: pet.id })));
    return;
  }

  const filteredChoices = pets.filter((pet) =>
    pet.name.startsWith(focusedPetOption),
  );

  const results = filteredChoices.map((pet) => {
    return {
      name: `${pet.name} | ${pet.type}`,
      value: pet.id,
    };
  });

  interaction.respond(results.slice(0, 25));
}
