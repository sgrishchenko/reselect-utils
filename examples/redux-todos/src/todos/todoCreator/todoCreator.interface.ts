import { ActionCreator } from 'typescript-fsa';

export type TodoCreatorDispatchProps = {
  addTodo: ActionCreator<{ name: string }>;
};

export type TodoCreatorProps = TodoCreatorDispatchProps;
