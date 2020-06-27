import { createSelector } from 'reselect';
import { path } from 'reselect-utils';
import { todosViewSelector } from '../todosView.selector';

export const todoFilterSwitchPropsSelector = createSelector(
  path(todosViewSelector).filter(),
  (todoFilter) => ({
    todoFilter,
  }),
);
