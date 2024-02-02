/**
 * Validation handler options (validationsPath).
 */
export interface ValidationHandlerOptions {
  validationsPath: string;
}

/**
 * Private validation handler data.
 */
export interface ValidationHandlerData extends ValidationHandlerOptions {
  validations: Function[];
}
