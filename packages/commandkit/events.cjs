const { getCommandKit } = require('./dist/context/async-context.js');

export function useEvents() {
  const commandkit = getCommandKit(true);
  return commandkit.events;
}
