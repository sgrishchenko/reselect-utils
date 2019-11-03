import { createSelector } from 'reselect';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { createPathSelector } from 'reselect-utils';
import { todosViewSelector } from '../todosView.selector';
import { TodoFilter } from '../todosView.interface';

export default createSelector(
  createPathSelector(todosViewSelector).filter(TodoFilter.COMPLETED),
  todoFilter => ({
    todoFilter,
  }),
);
