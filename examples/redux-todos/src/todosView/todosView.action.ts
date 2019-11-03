import actionCreatorFactory from 'typescript-fsa';
import { TodoFilter } from './todosView.interface';

const actionCreator = actionCreatorFactory('Todos');

export const TodosViewAction = {
  setFilter: actionCreator<TodoFilter>('SET_FILTER'),
};
