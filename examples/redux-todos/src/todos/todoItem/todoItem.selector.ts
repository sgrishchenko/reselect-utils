import { createCachedSelector } from 're-reselect';
import { path, prop } from 'reselect-utils';
import { todoSelector } from '../todos.selector';
import { TodoItemProps } from './todoItem.interface';

export const todoItemPropsSelector = createCachedSelector(
  [
    path(todoSelector).name('To do something...'),
    path(todoSelector).completed(),
  ],
  (todoName, todoCompleted) => ({
    todoName,
    todoCompleted,
  }),
)(prop<TodoItemProps>().todoId());
