import { createSelector } from 'reselect';
import { createPathSelector } from 'reselect-utils';
import { todosViewSelector } from '../todosView.selector';
import { TodoFilter } from '../todosView.interface';

export default createSelector(
  createPathSelector(todosViewSelector).filter(TodoFilter.COMPLETED),
  todoFilter => ({
    todoFilter,
  }),
);
