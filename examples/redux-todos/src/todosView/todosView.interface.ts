import { TodosStateSegment } from '../todos/todos.interface';

export enum TodoFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export type TodosViewState = {
  filter: TodoFilter;
};

export type TodosViewStateSegment = TodosStateSegment & {
  todosView: TodosViewState;
};
