import { BasicCommandType, MessageContextCommandType, UserContextCommandType } from './types';

export class BasicSlashCommand {
    constructor(commandOptions: BasicCommandType) {
        Object.assign(this, commandOptions);
    }
}

export class UserContextCommand {
    constructor(commandOptions: UserContextCommandType) {
        Object.assign(this, commandOptions);
    }
}

export class MessageContextCommand {
    constructor(commandOptions: MessageContextCommandType) {
        Object.assign(this, commandOptions);
    }
}
