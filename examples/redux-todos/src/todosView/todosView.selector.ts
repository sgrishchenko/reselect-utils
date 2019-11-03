import { TodosViewStateSegment } from './todosView.interface';

export const todosViewSelector = (state: TodosViewStateSegment) =>
  state.todosView;
