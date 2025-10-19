async function bootstrap() {
  // load .env
  process.loadEnvFile();

  // start commandkit
  const { commandkit } = await import('commandkit');
  const { Client } = await import('discord.js');
  const app = await import('./app.js').then((m) => m.default ?? m);

  if (!app || !(app instanceof Client)) {
    throw new Error('The app file must default export the discord.js client instance');
  }

  commandkit.setClient(app);

  await commandkit.start();
}

await bootstrap().catch((e) => {
  console.error('Failed to bootstrap CommandKit application:\n', e.stack);
});
