export interface ValidationHandlerOptions {
  validationsPath: string;
}

export interface ValidationHandlerData extends ValidationHandlerOptions {
  validations: Function[];
}
