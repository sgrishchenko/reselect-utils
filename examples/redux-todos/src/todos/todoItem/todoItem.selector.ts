import createCachedSelector from 're-reselect';
import {
  createPathSelector,
  createPropSelector,
  CounterObjectCache,
} from 'reselect-utils';
import { todoSelector } from '../todos.selector';
import { TodoItemOwnProps } from './todoItem.interface';

export default createCachedSelector(
  [
    createPathSelector(todoSelector).name('To do something...'),
    createPathSelector(todoSelector).completed(false),
  ],
  (todoName, todoCompleted) => ({
    todoName,
    todoCompleted,
  }),
)(createPropSelector<TodoItemOwnProps>().todoId(), {
  cacheObject: new CounterObjectCache(),
});
