import { ActionCreator } from 'typescript-fsa';

export type TodoItemOwnProps = {
  todoId: string;
};

export type TodoItemStateProps = {
  todoName: string;
  todoCompleted: boolean;
};

export type TodoItemDispatchProps = {
  removeTodo: ActionCreator<{ id: string }>;
  completeTodo: ActionCreator<{ id: string; completed: boolean }>;
};

export type TodoItemProps = TodoItemOwnProps &
  TodoItemStateProps &
  TodoItemDispatchProps;
