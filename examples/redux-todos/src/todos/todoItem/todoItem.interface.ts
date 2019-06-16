import { ActionCreator } from 'typescript-fsa';
import { Todo } from '../todos.interface';

export type TodoItemOwnProps = {
  todoId: string;
};

export type TodoItemStateProps = {
  todo: Todo;
};

export type TodoItemDispatchProps = {
  removeTodo: ActionCreator<{ id: string }>;
  completeTodo: ActionCreator<{ id: string; completed: boolean }>;
};

export type TodoItemProps = TodoItemOwnProps &
  TodoItemStateProps &
  TodoItemDispatchProps;
