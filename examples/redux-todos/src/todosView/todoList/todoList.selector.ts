import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { chain, path, prop, bound } from 'reselect-utils';
import { TodoFilter } from '../todosView.interface';
import { todosSelector } from '../../todos/todos.selector';
import { todosViewSelector } from '../todosView.selector';

const todoListSelector = createSelector(todosSelector, (todos) =>
  Object.values(todos),
);

type IsCompletedProps = { completed: boolean };

const filteredTodoListSelector = createCachedSelector(
  todoListSelector,
  prop<IsCompletedProps>().completed(),
  (todos, completed) => {
    return todos.filter((todo) => todo.completed === completed);
  },
)((state, props) => String(props.completed));

export const todoListPropsSelector = chain(path(todosViewSelector).filter())
  .chain((todoFilter) => {
    return todoFilter === TodoFilter.ALL
      ? todoListSelector
      : bound(filteredTodoListSelector, {
          completed: todoFilter === TodoFilter.COMPLETED,
        });
  })
  .map((todos) => ({
    todos,
  }))
  .build();
