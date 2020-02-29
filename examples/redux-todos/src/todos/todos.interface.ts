export type Todo = {
  id: string;
  name?: string;
  completed: boolean;
};

export type TodosState = Record<string, Todo>;

export type TodosStateSegment = {
  todos: TodosState;
};
