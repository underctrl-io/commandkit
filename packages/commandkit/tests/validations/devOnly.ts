import type { ValidationFunctionProps } from '../../src';

export default function ({ interaction, commandObj, handler }: ValidationFunctionProps) {
    console.log(commandObj);

    return true;
}
