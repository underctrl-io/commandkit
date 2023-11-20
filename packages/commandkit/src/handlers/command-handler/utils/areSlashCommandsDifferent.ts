/**
 * Test if two slash commands are different.
 * @param appCommand - The application command.
 * @param localCommand - The local command.
 * @returns A boolean indicating whether these commands are different
 */
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
