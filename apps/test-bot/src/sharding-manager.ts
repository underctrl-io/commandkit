import { ShardingManager } from 'discord.js';
import { join } from 'node:path';

process.loadEnvFile('./.env');

const manager = new ShardingManager(join(import.meta.dirname, 'index.js'), {
  token: process.env.DISCORD_TOKEN,
  totalShards: 2,
  mode: 'worker',
});

manager.on('shardCreate', (shard) => console.log(`Launched shard ${shard.id}`));

await manager.spawn();
