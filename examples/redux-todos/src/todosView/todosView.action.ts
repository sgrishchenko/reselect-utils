import actionCreatorFactory from 'typescript-fsa';
import { TodoFilter } from './todosView.interface';

const actionCreator = actionCreatorFactory('Todos');

/* eslint-disable-next-line import/prefer-default-export */
export const TodosViewAction = {
  setFilter: actionCreator<TodoFilter>('SET_FILTER'),
};
