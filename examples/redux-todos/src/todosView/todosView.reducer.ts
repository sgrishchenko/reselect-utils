import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { TodoFilter, TodosViewState } from './todosView.interface';
import { TodosViewAction } from './todosView.action';

export const todosViewInitialState: TodosViewState = {
  filter: TodoFilter.ALL,
};

export const todosViewReducer = reducerWithInitialState(
  todosViewInitialState,
).case(TodosViewAction.setFilter, (state, filter) => ({
  ...state,
  filter,
}));
