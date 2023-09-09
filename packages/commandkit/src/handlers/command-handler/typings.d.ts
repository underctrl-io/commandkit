import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction } from 'discord.js';
import { ContextCommandObject, SlashCommandObject } from '../../typings';
import { CommandKit } from '../../CommandKit';

export interface CommandHandlerOptions {
    client: Client;
    commandsPath: string;
    devGuildIds: string[];
    devUserIds: string[];
    devRoleIds: string[];
    customValidations: Function[];
    skipBuiltInValidations: boolean;
    commandKitInstance: CommandKit;
}

export interface CommandHandlerData extends CommandHandlerOptions {
    commands: Array<SlashCommandObject | ContextCommandObject>;
    builtInValidations: Array<BuiltInValidation>;
}

export interface BuiltInValidationParams {
    targetCommand: SlashCommandObject | ContextCommandObject;
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    handlerData: CommandHandlerData;
}

export type BuiltInValidation = ({}: BuiltInValidationParams) => boolean | void;
