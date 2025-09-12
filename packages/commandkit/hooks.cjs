const {
  useEnvironment,
  useStore,
  getContext,
  getCommandKit,
} = require('./dist/context/async-context.js');
const {
  getEventWorkerContext,
} = require('./dist/app/events/EventWorkerContext.js');

function useAnyEnvironment() {
  const commandCtx = getContext();
  if (commandCtx) return commandCtx;

  const eventWorkerCtx = getEventWorkerContext();
  if (eventWorkerCtx) return eventWorkerCtx;

  throw new Error(
    'No environment found. This hook must be used within a CommandKit environment.',
  );
}

function useClient() {
  const { client } = useAnyEnvironment().commandkit;
  return client;
}

function useCommandKit() {
  try {
    const { commandkit } = useAnyEnvironment();
    return commandkit;
  } catch {
    return getCommandKit(true);
  }
}

function useCommand() {
  return useEnvironment().context.command;
}

function useEvent() {
  const eventCtx = getEventWorkerContext();

  if (!eventCtx) {
    throw new Error(
      'No event context found. This hook must be used within an event worker environment.',
    );
  }

  return eventCtx.data;
}

module.exports = {
  useAnyEnvironment,
  useStore,
  useClient,
  useCommandKit,
  useCommand,
  useEvent,
};
