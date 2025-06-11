import { Schema, tool } from 'ai';
import { AiContext } from '../../context';
import { getAiWorkerContext } from '../../ai-context-worker';
import { z } from 'zod';

/**
 * Utility type that represents a value that can be either synchronous or asynchronous.
 * @template T - The type of the value
 * @internal
 */
type Awaitable<T> = T | Promise<T>;

/**
 * Type representing the parameters schema for AI tools.
 * Extracted from the first parameter of the `tool` function from the 'ai' library.
 */
export type ToolParameterType = Parameters<typeof tool>[0]['parameters'];

/**
 * Utility type that infers the TypeScript type from a tool parameter schema.
 * Supports both Zod schemas and AI library schemas.
 * @template T - The tool parameter type to infer from
 */
export type InferParameters<T extends ToolParameterType> =
  T extends Schema<any>
    ? T['_type']
    : T extends z.ZodTypeAny
      ? z.infer<T>
      : never;

/**
 * Configuration options for creating an AI tool.
 * @template T - The parameter schema type for the tool
 * @template R - The return type of the tool's execute function
 */
export interface CreateToolOptions<T extends ToolParameterType, R = unknown> {
  /** The unique name identifier for the tool */
  name: string;
  /** A human-readable description of what the tool does */
  description: string;
  /** The parameter schema that defines the tool's input structure */
  parameters: T;
  /** The function that executes when the tool is called */
  execute: ToolExecuteFunction<T, R>;
}

/**
 * Type definition for a tool's execute function.
 * @template T - The parameter schema type
 * @template R - The return type of the function
 * @param ctx - The AI context containing request and response information
 * @param parameters - The validated parameters passed to the tool
 * @returns The result of the tool execution, which can be synchronous or asynchronous
 */
export type ToolExecuteFunction<T extends ToolParameterType, R> = (
  ctx: AiContext,
  parameters: InferParameters<T>,
) => Awaitable<R>;

/**
 * Creates a new AI tool with the specified configuration.
 * This function wraps the underlying AI library's tool creation with additional
 * context management and parameter validation.
 *
 * @template T - The parameter schema type for the tool
 * @template R - The return type of the tool's execute function
 * @param options - The configuration options for the tool
 * @returns A configured AI tool ready for use
 *
 * @example
 * ```typescript
 * const myTool = createTool({
 *   name: 'calculate',
 *   description: 'Performs basic arithmetic calculations',
 *   parameters: z.object({
 *     operation: z.enum(['add', 'subtract']),
 *     a: z.number(),
 *     b: z.number(),
 *   }),
 *   execute: async (ctx, params) => {
 *     return params.operation === 'add'
 *       ? params.a + params.b
 *       : params.a - params.b;
 *   },
 * });
 * ```
 */
export function createTool<T extends ToolParameterType, R = unknown>(
  options: CreateToolOptions<T, R>,
) {
  // @ts-ignore - Suppressing type checking due to complex generic inference
  const _tool = tool<T, R>({
    name: options.name,
    description: options.description,
    parameters: options.parameters,
    async execute(params) {
      const { ctx } = getAiWorkerContext();

      ctx.setParams(params);

      return options.execute(ctx, params as InferParameters<T>);
    },
  });

  return _tool;
}
