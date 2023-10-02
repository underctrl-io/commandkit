import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { CommandFileObject } from '../../typings';

export interface CommandHandlerOptions {
    client: Client;
    commandsPath: string;
    devGuildIds: string[];
    devUserIds: string[];
    devRoleIds: string[];
    customValidations: Function[];
    skipBuiltInValidations: boolean;
    handler: CommandKit;
    bulkRegister: boolean;
}

export interface CommandHandlerData extends CommandHandlerOptions {
    commands: CommandFileObject[];
    builtInValidations: Array<BuiltInValidation>;
}

export interface BuiltInValidationParams {
    targetCommand: CommandFileObject;
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    handlerData: CommandHandlerData;
}

export type BuiltInValidation = ({}: BuiltInValidationParams) => boolean | void;
