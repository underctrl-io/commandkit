import type { TaskContext, TaskConfig } from '../src';

export const config: TaskConfig = {
  name: 'refresh-exchange-rate', // uses file name by default
  // Run every 24 hours using cron syntax
  pattern: '0 0 * * *',
  // Alternative way to specify using friendly syntax
  // every: '1 day',
};

export default async function refreshExchangeRate(ctx: TaskContext) {
  // ctx contains client and commandkit instances
  const { client, commandkit } = ctx;

  // This is where you would fetch exchange rate data from an API
  console.log(`[${new Date().toISOString()}] Refreshing exchange rates...`);

  // Example: Update exchange rates in your database or cache
  // const rates = await fetchExchangeRates();
  // await updateDatabase(rates);

  console.log('Exchange rates updated successfully!');
}
