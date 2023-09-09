import type { ValidationFunctionProps } from '../../src';

export default function ({ interaction, commandObj, handler }: ValidationFunctionProps) {
    console.log(commandObj);
    console.log(handler.commands);

    return true;
}
