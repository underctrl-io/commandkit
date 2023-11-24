import type { ValidationHandlerData, ValidationHandlerOptions } from './typings';
import { toFileURL } from '../../utils/resolve-file-url';
import { getFilePaths } from '../../utils/get-paths';
import colors from '../../utils/colors';
import rdfc from 'rfdc';

const clone = rdfc();

/**
 * A handler for command validations.
 */
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
        const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;

        const validationPaths = await getFilePaths(this.#data.validationsPath, true);
        const validationFilePaths = validationPaths.filter((path) => allowedExtensions.test(path));

        for (const validationFilePath of validationFilePaths) {
            const modulePath = toFileURL(validationFilePath);

            let importedFunction = (await import(`${modulePath}?t=${Date.now()}`)).default;
            let validationFunction = clone(importedFunction);

            // If it's CommonJS, invalidate the import cache
            if (typeof module !== 'undefined' && typeof require !== 'undefined') {
                delete require.cache[require.resolve(validationFilePath)];
            }

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

    async reloadValidations() {
        this.#data.validations = [];

        await this.#buildValidations();
    }
}
