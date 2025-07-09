import type { Awaitable, MessageQueue } from '../driver';
import type { PubSubRedisBroker } from '@discordjs/brokers';

type MessageHandler = ({
  data,
  ack,
}: {
  data: any;
  ack: () => Promise<void>;
}) => Awaitable<void>;

type Handler<TEvent extends Record<string, any> = Record<string, any>> = (
  message: TEvent[keyof TEvent],
) => Awaitable<void>;

export class RedisPubSubDriver<
  TEvent extends Record<string, any> = Record<string, any>,
> implements MessageQueue
{
  private handlers = new Map<keyof TEvent, MessageHandler>();
  public constructor(public readonly broker: PubSubRedisBroker<TEvent>) {}

  public async send<T extends keyof TEvent>(
    topic: T,
    message: TEvent[T],
  ): Promise<void> {
    await this.broker.publish(topic, message);
  }

  public async receive<T extends keyof TEvent>(
    topic: T,
    handler: Handler<TEvent>,
  ): Promise<void> {
    await this.broker.subscribe([topic]);

    if (!this.handlers.has(topic)) {
      const fn: MessageHandler = async ({ data, ack }) => {
        await handler(data);
        void ack();
      };

      // @ts-ignore
      this.broker.on(topic, fn);
      this.handlers.set(topic, fn);
    }
  }

  public async close(): Promise<void> {
    for (const [topic, handler] of this.handlers) {
      // @ts-ignore
      this.broker.removeListener(topic, handler);
    }
    this.handlers.clear();

    await this.broker.destroy();
  }
}
