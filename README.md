# CommandKit

CommandKit is a library that makes it easy to handle commands (+ validations), and events in your Discord.js projects.

**Supports Discord.js version 14**

# Features

-   Very beginner friendly 🚀
-   Support for slash and context menu commands ✅
-   Automatic command registration, edits, and deletion 🤖
-   Supports multiple development servers 🤝
-   Supports multiple users as bot developers 👥
-   Object oriented 💻

# Documentation

You can find the full documentation [here](https://commandkit.underctrl.io)

# Installation

[![npm](https://nodei.co/npm/commandkit.png)](https://nodei.co/npm/commandkit/)

To install CommandKit, simply run the following command:

For npm:

```bash
npm install commandkit
```

For yarn:

```bash
yarn add commandkit
```

# Usage

This is a simple overview of how to set up this library with all the options. You can read more in the [full documentation](https://commandkit.underctrl.io)

```js
// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

new CommandKit({
    // Your discord.js client object
    client,

    // Path to the commands folder
    commandsPath: path.join(__dirname, 'commands'),

    // Path to the events folder
    eventsPath: path.join(__dirname, 'events'),

    // Path to the validations folder (only valid if "commandsPath" was provided)
    validationsPath: path.join(__dirname, 'validations'),

    // Array of development server IDs (used to register and run devOnly commands)
    devGuildIds: ['DEV_SERVER_ID_1', 'DEV_SERVER_ID_2'],

    // Array of developer user IDs (used for devOnly commands)
    devUserIds: ['DEV_USER_ID_1', 'DEV_USER_ID_2'],

    // Array of developer role IDs (used for devOnly commands)
    devRoleIds: ['DEV_ROLE_ID_1', 'DEV_ROLE_ID_2'],

    // A property that disables CommandKit's built-in validations
    skipBuiltInValidations: true,
});

client.login('YOUR_TOKEN_HERE');
```
