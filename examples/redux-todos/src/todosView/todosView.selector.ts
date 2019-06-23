import { TodosViewStateSegment } from './todosView.interface';

/* eslint-disable-next-line import/prefer-default-export */
export const todosViewSelector = (state: TodosViewStateSegment) =>
  state.todosView;
