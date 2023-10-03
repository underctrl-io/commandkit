import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { CommandFileObject } from '../../typings';
import { ValidationHandler } from '../validation-handler/ValidationHandler';

export interface CommandHandlerOptions {
    client: Client;
    commandsPath: string;
    devGuildIds: string[];
    devUserIds: string[];
    devRoleIds: string[];
    validationHandler?: ValidationHandler;
    skipBuiltInValidations: boolean;
    commandkitInstance: CommandKit;
    bulkRegister: boolean;
}

export interface CommandHandlerData extends CommandHandlerOptions {
    commands: CommandFileObject[];
    builtInValidations: Array<BuiltInValidation>;
    validationHandler?: ValidationHandler;
}

export interface BuiltInValidationParams {
    targetCommand: CommandFileObject;
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    handlerData: CommandHandlerData;
}

export type BuiltInValidation = ({}: BuiltInValidationParams) => boolean | void;
