export default function areSlashCommandsDifferent(appCommand: any, localCommand: any) {
    if (!appCommand.options) appCommand.options = [];
    if (!localCommand.options) localCommand.options = [];

    if (!appCommand.description) appCommand.description = '';
    if (!localCommand.description) localCommand.description = '';

    if (
        localCommand.description !== appCommand.description ||
        localCommand.options.length !== appCommand.options.length
    ) {
        return true;
    }
}
