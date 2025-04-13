import { TaskManager } from './TaskManager';

export type JSONEncodable =
  | string
  | number
  | boolean
  | null
  | JSONEncodable[]
  | { [key: string]: JSONEncodable };

export interface TaskDefinition {
  name: string;
  id?: string;
  data?: JSONEncodable;
  duration?: number | Date | string;
}

export class TaskContextManager {
  public constructor(private manager: TaskManager) {}

  public async create(task: TaskDefinition) {}

  public async cancel(task: string) {}

  public async complete(task: string) {}

  public async fail(task: string) {}

  public async invoke(task: string, data: JSONEncodable) {}

  public async update(task: string, data: JSONEncodable) {}

  public async get(task: string) {}

  public async isPending(task: string) {}

  public async isDynamic(task: string) {}

  public async isStatic(task: string) {}
}
