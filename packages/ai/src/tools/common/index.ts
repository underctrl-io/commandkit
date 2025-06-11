import { Schema, tool } from 'ai';
import { AiContext } from '../../context';
import { getAiWorkerContext } from '../../ai-context-worker';
import { z } from 'zod';

type Awaitable<T> = T | Promise<T>;

export type ToolParameterType = Parameters<typeof tool>[0]['parameters'];
export type InferParameters<T extends ToolParameterType> =
  T extends Schema<any>
    ? T['_type']
    : T extends z.ZodTypeAny
      ? z.infer<T>
      : never;

export interface CreateToolOptions<T extends ToolParameterType, R = unknown> {
  name: string;
  description: string;
  parameters: T;
  execute: ToolExecuteFunction<T, R>;
}

export type ToolExecuteFunction<T extends ToolParameterType, R> = (
  ctx: AiContext,
  parameters: InferParameters<T>,
) => Awaitable<R>;

export function createTool<T extends ToolParameterType, R = unknown>(
  options: CreateToolOptions<T, R>,
) {
  // @ts-ignore
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
