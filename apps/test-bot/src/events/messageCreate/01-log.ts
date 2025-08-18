import {
  type EventHandler,
  stopEvents,
  isErrorType,
  CommandKitErrorCodes,
} from 'commandkit';

const handler: EventHandler<'messageCreate'> = (message) => {
  try {
    // code that may throw an error

    stopEvents(); // conditionally stop the event chain
  } catch (error) {
    if (isErrorType(error, CommandKitErrorCodes.StopEvents)) {
      console.log('Stopping event chain');
      // if stopEvents() is called in the try block, throw it so CommandKit can stop the event chain
      throw error;
    }

    console.log('Not stopping event chain');
    // this means that the code threw the error, and stopEvents() was not called
    // the rest of the event handlers will be executed as normal
    console.error(error);
  }
};

export default handler;
