import type { ValidationHandlerData, ValidationHandlerOptions } from './typings';
import { toFileURL } from '../../utils/resolve-file-url';
import { getFilePaths } from '../../utils/get-paths';
import colors from '../../utils/colors';

export class ValidationHandler {
    #data: ValidationHandlerData;

    constructor({ ...options }: ValidationHandlerOptions) {
        this.#data = {
            ...options,
            validations: [],
        };
    }

    async init() {
        await this.#buildValidations();
    }

    async #buildValidations() {
        const validationFilePaths = getFilePaths(this.#data.validationsPath, true).filter(
            (path) => path.endsWith('.js') || path.endsWith('.ts'),
        );

        for (const validationFilePath of validationFilePaths) {
            const modulePath = toFileURL(validationFilePath);

            let validationFunction = (await import(modulePath)).default;

            if (validationFunction?.default) {
                validationFunction = validationFunction.default;
            }

            const compactFilePath =
                validationFilePath.split(process.cwd())[1] || validationFilePath;

            if (typeof validationFunction !== 'function') {
                console.log(
                    colors.yellow(
                        `⏩ Ignoring: Validation ${compactFilePath} does not export a function.`,
                    ),
                );
                continue;
            }

            this.#data.validations.push(validationFunction);
        }
    }

    get validations() {
        return this.#data.validations;
    }
}
