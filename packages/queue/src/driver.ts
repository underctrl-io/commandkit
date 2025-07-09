export type Awaitable<T> = T | Promise<T>;

export interface MessageQueue {
  send(topic: string, message: any): Promise<void>;
  receive(
    topic: string,
    handler: (message: any) => Awaitable<void>,
  ): Promise<void>;
  close?(): Promise<void>;
}
