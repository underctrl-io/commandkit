import { MicroDocgenLink } from 'micro-docgen';

const links = [
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/Client:Class',
    patterns: ['Client<true>', 'Client<boolean>'],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/AutocompleteInteraction:Class',
    patterns: ['AutocompleteInteraction', 'AutocompleteInteraction<CacheType>'],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/ContextMenuCommandInteraction:Class',
    patterns: [
      'ContextMenuCommandInteraction',
      'ContextMenuCommandInteraction<CacheType>',
    ],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/AutocompleteInteraction:Class',
    patterns: ['AutocompleteInteraction', 'AutocompleteInteraction<CacheType>'],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/ChatInputCommandInteraction:Class',
    patterns: [
      'ChatInputCommandInteraction',
      'ChatInputCommandInteraction<CacheType>',
    ],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/MessageContextMenuCommandInteraction:Class',
    patterns: [
      'MessageContextMenuCommandInteraction',
      'MessageContextMenuCommandInteraction<CacheType>',
    ],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/UserContextMenuCommandInteraction:Class',
    patterns: [
      'UserContextMenuCommandInteraction',
      'UserContextMenuCommandInteraction<CacheType>',
    ],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/Interaction:Class',
    patterns: ['Interaction', 'Interaction<CacheType>'],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/ButtonComponentData:TypeAlias',
    patterns: ['ButtonComponentData'],
  },
  {
    link: 'https://discord.js.org/docs/packages/discord.js/main/ComponentEmojiResolvable:TypeAlias',
    patterns: ['ComponentEmojiResolvable'],
  },
  {
    link: 'https://discord-api-types.dev/api/discord-api-types-v10#RESTPostAPIApplicationCommandsJSONBody',
    patterns: ['RESTPostAPIApplicationCommandsJSONBody'],
  },
  {
    link: 'https://discord-api-types.dev/api/discord-api-types-v10#RESTPutAPIApplicationCommandsJSONBody',
    patterns: ['RESTPutAPIApplicationCommandsJSONBody'],
  },
  {
    link: 'https://discord-api-types.dev/api/discord-api-types-v10#APIButtonComponent',
    patterns: ['APIButtonComponent'],
  },
  {
    link: 'https://discord-api-types.dev/api/discord-api-types-v10/enum/ButtonStyle',
    patterns: ['ButtonStyle'],
  },
];

const DiscordLinks: MicroDocgenLink = {};

for (const { link, patterns } of links) {
  for (const pattern of patterns) {
    DiscordLinks[pattern] = link;
  }
}

export { DiscordLinks };
