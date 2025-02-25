import { CommandKitPluginRuntime } from '../..';

const CommandKitPluginEvents = {
  'client-login': {
    name: 'ClientLogin',
    cancelable: false,
  },
} as const;

type EventName =
  (typeof CommandKitPluginEvents)[keyof typeof CommandKitPluginEvents]['name'];

export const PluginEvents = Object.fromEntries(
  Object.entries(CommandKitPluginEvents).map(([key, value]) => [
    value.name,
    class extends Event {
      public target!: CommandKitPluginRuntime;

      public constructor() {
        super(key, { cancelable: value.cancelable });
      }
    },
  ]),
) as unknown as Record<EventName, new () => Event>;
