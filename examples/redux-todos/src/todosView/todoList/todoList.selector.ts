import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import {
  SelectorMonad,
  createPathSelector,
  createPropSelector,
  createBoundSelector,
  // @ts-ignore
  // eslint-disable-next-line import/no-unresolved
} from 'reselect-utils';
import { TodoFilter } from '../todosView.interface';
import { todosSelector } from '../../todos/todos.selector';
import { todosViewSelector } from '../todosView.selector';

const todoListSelector = createSelector(
  todosSelector,
  todos => Object.values(todos),
);

type IsCompletedProps = { completed: boolean };

const filteredTodoListSelector = createCachedSelector(
  todoListSelector,
  createPropSelector<IsCompletedProps>().completed(),
  (todos, completed) => {
    return todos.filter(todo => todo.completed === completed);
  },
)((state, props) => String(props.completed));

export default SelectorMonad.of(createPathSelector(todosViewSelector).filter())
  // @ts-ignore
  .chain(todoFilter => {
    return todoFilter === TodoFilter.ALL
      ? todoListSelector
      : createBoundSelector(filteredTodoListSelector, {
          completed: todoFilter === TodoFilter.COMPLETED,
        });
  })
  // @ts-ignore
  .map(todos => ({
    todos,
  }))
  .buildSelector();
