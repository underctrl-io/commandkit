<div align="center">
    <img src="https://raw.githubusercontent.com/underctrl-io/commandkit/master/apps/docs/public/ckit_logo.png" width="60%" />
    <br />
    <a href="https://ctrl.lol/discord"><img src="https://img.shields.io/discord/1055188344188973066?color=5865F2&logo=discord&logoColor=white" alt="support server" /></a>
    <a href="https://www.npmjs.com/package/commandkit"><img src="https://img.shields.io/npm/v/commandkit?maxAge=3600" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/commandkit"><img src="https://img.shields.io/npm/dt/commandkit?maxAge=3600" alt="npm downloads" /></a>
</div>

# CommandKit

CommandKit is a library that makes it easy to handle commands and events in your Discord.js projects.

> **Supports Discord.js version 14**

## Features

-   Very beginner friendly 🚀
-   Support for slash and context menu commands ✅
-   Automatic command registration, edits, and deletion 🤖
-   Supports multiple development servers 🤝
-   Supports multiple users as bot developers 👥
-   Object oriented 💻

## Documentation

You can find the full documentation [here](https://commandkit.js.org).

## Installation

[![npm](https://nodei.co/npm/commandkit.png)](https://nodei.co/npm/commandkit/)

To install CommandKit, simply run the following command:

For npm:

```bash
npm install commandkit
```

Yarn:

```bash
yarn add commandkit
```

pnpm:

```bash
pnpm add commandkit
```

### Install development version

To install the development version of CommandKit, run the following command:

```bash
npm install commandkit@dev
```

> ⚠️ The development version is likely to have bugs.

## Usage

This is a simple overview of how to set up this library with all the options. You can read more in the [full documentation](https://commandkit.js.org)

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
    devGuildIds: ['1234567890', '0987654321'],

    // Array of developer user IDs (used for devOnly commands)
    devUserIds: ['1234567890', '0987654321'],

    // Array of developer role IDs (used for devOnly commands)
    devRoleIds: ['1234567890', '0987654321'],

    // A property that disables CommandKit's built-in validations
    skipBuiltInValidations: true,
});

client.login('YOUR_TOKEN_HERE');
```

## Support and Suggestions

If you are looking for support or want to provide suggestions, check out the [Discord](https://ctrl.lol/discord).