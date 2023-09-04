---
title: Migrating from DJS-Commander to CommandKit
---

If you're trying to use CommandKit as a drop-in replacement for DJS-Commander, you'll need to make a few changes to your code.

:::caution
This guide is **not** introducing the features this library offers over DJS-Commander. It's just going over the changes you'll need to make to your code to get it working with this library.
:::

## Setting up the command handler

In DJS-Commander, you'd import and instantiate the `CommandHandler` class. The only difference with CommandKit is the name of the class. Instead of `CommandHandler`, it's called `CommandKit`.

```js
const { CommandKit } = require('commandkit');

new CommandKit({
    client,
    commandsPath,
    eventsPath,
});
```

## Setting up development servers

In DJS-Commander only a single development server was supported, and it was setup under the property name `testServer` when instantiating `CommandHandler`.

```js
new CommandHandler({
    client,
    commandsPath,
    eventsPath,
    testServer: '123456789012345678', // ❌
});
```

In CommandKit, you can setup multiple development servers under the property name `devServerIds`

```js
new CommandKit({
    client,
    commandsPath,
    eventsPath,
    devServerIds: ['123456789012345678', '876543210987654321'], // ✅
});
```

However, this does not automatically register all the commands in those specific servers. By default, CommandKit will globally register all commands. If you want to register commands in specific servers, you'll need to use the `devOnly` property inside `options` from within the command file object.

```js
module.exports = {
    data: {
        name: 'ping',
        description: 'Pong!',
    },

    run: ({ interaction }) => {
        interaction.reply('Pong!');
    },

    options: {
        devOnly: true, // ✅
    },
};
```

This command will now be registered in your development server, however you won't be able to run this command as you haven't configure the developer user IDs. Yes, CommandKit has built in support for developer user IDs! You can set them up under the property name `devUserIds` when instantiating `CommandKit`.

```js
new CommandKit({
    client,
    commandsPath,
    eventsPath,
    devServerIds: ['123456789012345678', '876543210987654321'],
    devUserIds: ['123456789012345678', '876543210987654321'], // ✅
});
```

## Deleting commands

Deleting commands with CommandKit is a bit different from DJS-Commander's. In DJS-Commander you'd directly export the `deleted` property from the command object. In CommandKit, you're required to export the `deleted` property inside another object called `options`.

```js
module.exports = {
    data: {
        name: 'ping',
        description: 'Pong!',
    },

    run: ({ interaction }) => {
        interaction.reply('Pong!');
    },

    deleted: true, // ❌

    options: {
        deleted: true, // ✅
    },
};
```

## Updating validations parameters

In DJS-Commander, you'd get access to the `interaction` and `commandObj` in a specified order through the parameters. In CommandKit, you get access to the `interaction` and `commandObj` through an object.

```js
// DJS-Commander
module.exports = (interaction, commandObj) => {}; // ❌

// CommandKit
module.exports = ({ interaction, commandObj }) => {}; // ✅
```
