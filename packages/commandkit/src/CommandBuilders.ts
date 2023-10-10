import { PermissionResolvable } from 'discord.js';
import {
    AnySlashCommandData,
    AnyContextCommandData,
    SlashCommandRunFunction,
    UserContextCommandRunFunction,
    MessageContextCommandRunFunction,
    CommandOptions,
} from './types';

export class SlashCommand {
    public data!: AnySlashCommandData
    public options: CommandOptions = {
        deleted: false,
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: [],
    }
    public run!: SlashCommandRunFunction;

    setData(
        data: AnySlashCommandData
    ) {
        this.data = data;
        return this;
    }

    setDeveloper(dev: boolean) {
        this.options.devOnly = dev;
        return this;
    }

    setGuildOnly(guildOnly: boolean) {
        this.options.guildOnly = guildOnly;
        return this;
    }

    setUserPermissions(userPermissions: PermissionResolvable) {
        this.options.userPermissions = userPermissions;
        return this;
    }

    setBotPermissions(botPermissions: PermissionResolvable) {
        this.options.botPermissions = botPermissions;
        return this;
    }

    setDeleted(deleted: boolean) {
        this.options.deleted = deleted;
        return this;
    }

    setRun(run: SlashCommandRunFunction) {
        this.run = run;
        return this;
    }
}

export class UserContextCommand {
    public data!: AnyContextCommandData
    public options: CommandOptions = {
        deleted: false,
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: [],
    }
    public run!: UserContextCommandRunFunction;

    setData(
        data: AnyContextCommandData
    ) {
        this.data = data;
        return this;
    }

    setDeveloper(dev: boolean) {
        this.options.devOnly = dev;
        return this;
    }

    setGuildOnly(guildOnly: boolean) {
        this.options.guildOnly = guildOnly;
        return this;
    }

    setUserPermissions(userPermissions: PermissionResolvable) {
        this.options.userPermissions = userPermissions;
        return this;
    }

    setBotPermissions(botPermissions: PermissionResolvable) {
        this.options.botPermissions = botPermissions;
        return this;
    }

    setDeleted(deleted: boolean) {
        this.options.deleted = deleted;
        return this;
    }

    setRun(run: UserContextCommandRunFunction) {
        this.run = run;
        return this;
    }
}

export class MessageContextCommand {
    public data!: AnyContextCommandData
    public options: CommandOptions = {
        deleted: false,
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: [],
    }
    public run!: MessageContextCommandRunFunction;

    setData(
        data: AnyContextCommandData
    ) {
        this.data = data;
        return this;
    }

    setDeveloper(dev: boolean) {
        this.options.devOnly = dev;
        return this;
    }

    setGuildOnly(guildOnly: boolean) {
        this.options.guildOnly = guildOnly;
        return this;
    }

    setUserPermissions(userPermissions: PermissionResolvable) {
        this.options.userPermissions = userPermissions;
        return this;
    }

    setBotPermissions(botPermissions: PermissionResolvable) {
        this.options.botPermissions = botPermissions;
        return this;
    }

    setDeleted(deleted: boolean) {
        this.options.deleted = deleted;
        return this;
    }

    setRun(run: MessageContextCommandRunFunction) {
        this.run = run;
        return this;
    }
}