import type { MessageQueue, Awaitable } from './driver';

let _driver: MessageQueue | null = null;

/**
 * Set the message queue driver.
 * @param driver The message queue driver to use.
 */
export function setDriver(driver: MessageQueue) {
  _driver = driver;
}

/**
 * Send a message to a topic.
 * @param topic The topic to send the message to.
 * @param message The message to send.
 */
export function send<T>(topic: string, message: T): Promise<void> {
  if (!_driver) {
    throw new Error('Message queue driver has not been set');
  }

  return _driver.send(topic, message);
}

/**
 * Receive a message from a topic.
 * @param topic The topic to receive the message from.
 * @param handler The handler to process the message.
 */
export function receive<T>(
  topic: string,
  handler: (message: T) => Awaitable<void>,
): Promise<void> {
  if (!_driver) {
    throw new Error('Message queue driver has not been set');
  }

  return _driver.receive(topic, handler);
}

export * from './driver';
