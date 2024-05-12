import { CommandFileObject } from '../../../typings';
import colors  from '../../../utils/colors'
export function checkDuplicateCommands(commands: CommandFileObject[]){
    let tempCommands = [...commands], duplicates = [], nonduplicates = [];
    for(let i = 0; tempCommands.length != 0;){
      let indexes = []
       let duplicatePairs = tempCommands.filter((obj, index) => {
        if(obj.data.name === tempCommands[i].data.name){
          indexes.push(index)
          return true
        }
        else return false
       })
       if(duplicatePairs.length > 1) duplicates.push(duplicatePairs)
       else nonduplicates.push(duplicatePairs)
       for(let j = indexes.length - 1; j > -1; j--){
         tempCommands.splice(indexes[j], 1)
       }
    }
    return {
        duplicates,
        nonduplicates
    }
  }
export function warnDuplicatesIfAny(commands: CommandFileObject[]){
  let { duplicates, nonduplicates } = checkDuplicateCommands(commands)
  for(let i = 0; i < duplicates.length; i++){
    let myString = `You have duplicate command names with command: ${colors.red(duplicates[i][0].data.name)} in the following files:`
    for(let j = 0; j < duplicates[i].length; j++){
        myString += `\n${duplicates[i][j].filePath}`
    }
    console.log(colors.yellow('[WARNING]'), myString)
  }
}
