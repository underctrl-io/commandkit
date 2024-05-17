import { CommandFileObject } from '../../../typings';
import colors  from '../../../utils/colors'
export function checkDuplicateCommands(commands: CommandFileObject[]) {
    const commandObj: { [key: string]: CommandFileObject[] } = {}, duplicatePairsArray: CommandFileObject[][] = [], nonduplicateArray: CommandFileObject[] = [];
    commands.forEach(command => {
        const name = command.data.name;
        if (!commandObj[name]) commandObj[name] = []
        commandObj[name].push(command);
    });
    for (const key in commandObj) {
        if (commandObj[key].length > 1) duplicatePairsArray.push(commandObj[key]) 
        else nonduplicateArray.push(commandObj[key][0])
    }
    return {
        duplicatePairsArray,
        nonduplicateArray
    };
}
function commandType(command: CommandFileObject) {
    return command.options.devOnly ? "(devOnly) dm_permission: false" : `(global) dm_permission: ${(command.data.dm_permission !== false)}`;
}
export function warnDuplicatesIfAny(commands: CommandFileObject[]){
    let { duplicatePairsArray, nonduplicateArray } = checkDuplicateCommands(commands);
    duplicatePairsArray.forEach(duplicatePair => {
      const commandName = colors.red(duplicatePair[0].data.name);
      const fileDetails = duplicatePair.map((dup: CommandFileObject) => `${dup.filePath} [${commandType(dup)}]`).join('\n');
      const warningMessage = `You have duplicate command names with command: ${commandName} in the following files:\n${fileDetails}`;
      console.log(colors.yellow('[WARNING]'), warningMessage);
    });
}
