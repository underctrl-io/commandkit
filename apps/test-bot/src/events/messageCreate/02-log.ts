import {
  type EventHandler,
  stopEvents,
  isErrorType,
  CommandKitErrorCodes,
  Logger,
} from 'commandkit';

const handler: EventHandler<'messageCreate'> = (message) => {
  try {
    // code that may throw an error

    throw new Error('test');

    // stopEvents(); // conditionally stop the event chain
  } catch (error) {
    if (isErrorType(error, CommandKitErrorCodes.StopEvents)) {
      Logger.log('Stopping event chain');
      // if stopEvents() is called in the try block, throw it so CommandKit can stop the event chain
      throw error;
    }

    Logger.log('Not stopping event chain');
    // this means that the code threw the error, and stopEvents() was not called
    // the rest of the event handlers will be executed as normal
    Logger.error(error);
  }
};

export default handler;
