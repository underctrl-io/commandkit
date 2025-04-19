import { CommandKit } from 'commandkit';
import { Client, GatewayIntentBits } from 'discord.js';
import { tasks, configureTaskManager, bullmq } from '../src';

// Create a Discord.js client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // Add other intents as needed
  ],
});

// Set up CommandKit with the tasks plugin
const commandkit = new CommandKit({
  client,
  devGuildIds: ['YOUR_DEV_GUILD_ID'],
  commandsPath: `${__dirname}/commands`,
  plugins: [tasks()],
});

// Configure the task manager to use the BullMQ driver
configureTaskManager(async (manager) => {
  // Create a BullMQ driver with Redis configuration
  const driver = bullmq({
    redis: {
      host: 'localhost', // Redis host
      port: 6379, // Redis port
      // password: 'your-redis-password', // Uncomment if needed
      // url: 'redis://localhost:6379', // Alternative to host/port
    },
    queue: 'my-discord-bot-tasks', // Custom queue name
  });

  // Set the driver for the task manager
  manager.useDriver(driver);
});

// Login with your bot token
client.login('YOUR_BOT_TOKEN');

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await commandkit.destroy();
  process.exit(0);
});
