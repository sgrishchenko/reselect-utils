import { TodosStateSegment } from './todos.interface';

export const todosSelector = (state: TodosStateSegment) => state.todos;

export const todoSelector = (
  state: TodosStateSegment,
  props: { todoId: string },
) => state.todos[props.todoId];
