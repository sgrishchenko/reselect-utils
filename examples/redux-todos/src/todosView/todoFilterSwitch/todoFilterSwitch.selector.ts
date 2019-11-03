import { createSelector } from 'reselect';
import { path } from 'reselect-utils';
import { todosViewSelector } from '../todosView.selector';
import { TodoFilter } from '../todosView.interface';

export const todoFilterSwitchPropsSelector = createSelector(
  path(todosViewSelector).filter(TodoFilter.COMPLETED),
  todoFilter => ({
    todoFilter,
  }),
);
